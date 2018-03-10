/** @babel */

/**
 * Copyright (c) 2016-present PlatformIO <contact@platformio.org>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import * as config from './config';
import * as maintenance from './maintenance';
import * as pioNodeHelpers from 'platformio-node-helpers';
import * as utils from './utils';

import { TerminalConsumer, runCmdsInTerminal } from './services/terminal';
import { checkIDEUpdates, reinstallIDE } from './installer/ide';

import BuildProvider from './services/build';
import { BusyConsumer } from './services/busy';
import { CompositeDisposable } from 'atom';
import { DebuggerConsumer } from './services/debugger';
import HomeView from './home/view';
import InstallationManager from './installer/manager';
import ProjectObserver from './project/observer';
import { ToolbarConsumer } from './services/toolbar';
import { getActivePioProject } from './project/helpers';
import path from 'path';
import { command as serialMonitor } from './serial-monitor/command';


class PlatformIOIDEPackage {

  constructor() {
    this.subscriptions = new CompositeDisposable();
    this.config = config.ATOM_CONFIG;
    this.highlightSubscriptions = null;

    // services
    this.provideBuilder = () => BuildProvider;
    this.consumePlatformioIDETerminal = TerminalConsumer;
    this.consumeBusy = BusyConsumer;
    this.consumeToolbar = ToolbarConsumer;
    this.consumeDebugger = DebuggerConsumer;

    // misc
    this._reinstallIDETimer = null;
    this._projectObservable = null;
  }

  activate() {
    pioNodeHelpers.misc.patchOSEnviron({
      caller: 'atom',
      useBuiltinPIOCore: atom.config.get('platformio-ide.useBuiltinPIOCore'),
      extraPath: atom.config.get('platformio-ide.advanced.customPATH'),
      extraVars: {
        PLATFORMIO_IDE: utils.getIDEVersion()
      }
    });

    this.startInstaller()
      .then(() => this.setupCommands())
      .then(() => this._projectObservable = new ProjectObserver())
      .then(() => {
        if (pioNodeHelpers.home.showAtStartup('atom')) {
          atom.workspace.open('platformio-home://');
        }
      })
      .then(() => checkIDEUpdates());
  }

  async startInstaller() {
    const im = new InstallationManager();
    if (im.locked()) {
      atom.notifications.addInfo('PlatformIO IDE installation has been suspended.', {
        detail: 'Seems like PlatformIO IDE Installer is already started in another window.',
        dismissable: true
      });
    } else if (await im.check()) {
      return Promise.resolve();
    } else {
      im.lock();
      try {
        await im.install();
      } catch (err) {
        utils.notifyError('InstallationManager', err);
      }
      im.unlock();
    }
    im.destroy();
    return Promise.reject();
  }

  setupCommands() {
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'platformio-ide:maintenance.open-terminal': () => runCmdsInTerminal(['pio --help']),
      'platformio-ide:maintenance.serial-monitor': () => serialMonitor(),
      'platformio-ide:maintenance.serial-ports': () => runCmdsInTerminal(['pio device list']),
      'platformio-ide:maintenance.install-commands': () => maintenance.installCommands(),
      'platformio-ide:maintenance.update-platformio': () => runCmdsInTerminal(['platformio update']),
      'platformio-ide:maintenance.upgrade-platformio': () => runCmdsInTerminal(['platformio upgrade']),

      'platformio-ide:help-docs': () => utils.openUrl('http://docs.platformio.org/'),
      'platformio-ide:help-faq': () => utils.openUrl('http://docs.platformio.org/page/faq.html'),
      'platformio-ide:help.report-platformio-issue': () => utils.openUrl('https://github.com/platformio/platformio-core/issues'),
      'platformio-ide:help.community': () => utils.openUrl('https://community.platformio.org/'),

      'platformio-ide:help-twitter': () => utils.openUrl('https://twitter.com/PlatformIO_Org'),
      'platformio-ide:help-facebook': () => utils.openUrl('https://www.facebook.com/platformio'),

      'platformio-ide:help-website': () => utils.openUrl('http://platformio.org/'),
      'platformio-ide:donate': () => utils.openUrl('http://platformio.org/donate'),

      'platformio-ide:settings:pkg-platformio-ide': () => atom.workspace.open('atom://config/packages/platformio-ide/'),
      'platformio-ide:settings:pkg-platformio-ide-terminal': () => atom.workspace.open('atom://config/packages/platformio-ide-terminal/'),
      'platformio-ide:settings:pkg-build': () => atom.workspace.open('atom://config/packages/build/'),
      'platformio-ide:settings:pkg-file-icons': () => atom.workspace.open('atom://config/packages/file-icons/'),
      'platformio-ide:settings:pkg-linter': () => atom.workspace.open('atom://config/packages/linter/'),
      'platformio-ide:settings:pkg-minimap': () => atom.workspace.open('atom://config/packages/minimap/'),
      'platformio-ide:settings:pkg-tool-bar': () => atom.workspace.open('atom://config/packages/tool-bar/'),

      'platformio-ide:home': () => atom.workspace.open('platformio-home://'),
    }));


    this.subscriptions.add(
      atom.config.onDidChange('platformio-ide.advanced.useDevelopmentIDE', (event) => {
        if (this._reinstallIDETimer) {
          clearInterval(this._reinstallIDETimer);
        }
        this._reinstallIDETimer = setTimeout(() => reinstallIDE(event.newValue), 3000);
      })
    );

    this.subscriptions.add(
      atom.config.onDidChange('platformio-ide.useBuiltinPIOCore', () => {
        maintenance.reinstallPIOCore();
      })
    );

    this.subscriptions.add(
      atom.config.onDidChange('platformio-ide.advanced.useDevelopmentPIOCore', () => {
        maintenance.reinstallPIOCore();
      })
    );

    this.subscriptions.add(
      atom.config.onDidChange('platformio-ide.advanced.showPlatformIOFiles', () => {
        maintenance.handleShowPlatformIOFiles();
      })
    );
    maintenance.handleShowPlatformIOFiles();

    this.subscriptions.add(
      atom.config.onDidChange('platformio-ide.autoCloseSerialMonitor', () => {
        utils.runAtomCommand('build:refresh-targets');
      })
    );

    for (const target of ['build', 'upload', 'program', 'clean', 'test', 'debug', 'remote']) {
      this.subscriptions.add(atom.commands.add(
        'atom-workspace',
        `platformio-ide:target:${target}`,
        makeRunTargetCommand(target)
      ));
    }

    function makeRunTargetCommand(target) {
      return function() {
        const p = getActivePioProject();
        if (!p) {
          atom.notifications.addWarning('Can not find active PlatformIO project.', {
            detail: 'Make sure that an opened project you are trying to rebuid is ' +
              'a PlatformIO project (e.g., contains `platformio.ini`).'
          });
          return;
        }

        const status = utils.runAtomCommand(`platformio-ide:target:${target}-${p}`);
        if (!status) {
          atom.notifications.addError(`PlatformIO: Failed to run a command: ${target}`, {
            detail: 'Please make sure that "build" package is installed and activated.',
          });
        }
      };
    }

    this.subscriptions.add(atom.workspace.addOpener((uriToOpen) => {
      if (uriToOpen.startsWith('platformio-home://')) {
        return new HomeView({
          uri: uriToOpen
        });
      }
    }));

    this.subscriptions.add(atom.workspace.observeTextEditors((editor) => {
      const editorPath = editor.getPath();
      if (!editorPath) {
        return;
      }

      // Handle *.ino and *.pde files as C++
      const extname = path.extname(editorPath);
      if (['.ino', '.pde'].includes(extname)) {
        editor.setGrammar(atom.grammars.grammarForScopeName('source.cpp'));
        maintenance.notifyLinterDisabledforArduino();
      }

      if ('platformio.ini' === path.basename(editorPath)) {
        editor.onDidSave(() => utils.runAtomCommand('build:refresh-targets'));
      }
    }));

    this.subscriptions.add(atom.project.onDidChangePaths(() => {
      utils.runAtomCommand('tree-view:show');
    }));

    this.subscriptions.add(
      atom.config.onDidChange('platformio-ide.highlightActiveProject', (event) => {
        this.toggleActiveProjectHighlighter(event.newValue);
      })
    );
    this.toggleActiveProjectHighlighter(atom.config.get('platformio-ide.highlightActiveProject'));
  }

  toggleActiveProjectHighlighter(isEnabled) {
    const doHighlight = () => maintenance.highlightActiveProject(isEnabled);

    if (isEnabled) {
      if (!this.highlightSubscriptions) {
        this.highlightSubscriptions = new CompositeDisposable();
      }
      this.highlightSubscriptions.add(atom.workspace.onDidStopChangingActivePaneItem(doHighlight));
      this.highlightSubscriptions.add(atom.project.onDidChangePaths(doHighlight));
    } else {
      if (this.highlightSubscriptions) {
        this.highlightSubscriptions.dispose();
        this.highlightSubscriptions = null;
      }
    }
    doHighlight();
  }

  deactivate() {
    this.subscriptions.dispose();
    if (this.highlightSubscriptions) {
      this.highlightSubscriptions.dispose();
    }
    if (this._projectObservable) {
      this._projectObservable.dispose();
    }
    pioNodeHelpers.home.shutdownServer();
  }

}

const pioide = new PlatformIOIDEPackage();
export default pioide;
