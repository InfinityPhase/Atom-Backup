"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const etch = require("etch");
const atom_1 = require("atom");
class StatusIcon {
    constructor(props) {
        this.props = props;
        this.disposables = new atom_1.CompositeDisposable();
        etch.initialize(this);
        this.disposables.add(atom.tooltips.add(this.element, {
            class: 'ide-haskell-status-tooltip',
            title: () => {
                const res = [];
                for (const [plugin, { status, detail },] of this.props.statusMap.entries()) {
                    res.push(`
          <ide-haskell-status-item>
            <ide-haskell-status-icon data-status="${status}">${plugin}</ide-haskell-status-icon>
            <ide-haskell-status-detail>${detail ? detail : ''}</ide-haskell-status-detail>
          </ide-haskell-status-item>
          `);
                }
                return res.join('');
            },
        }));
    }
    render() {
        return (etch.dom("ide-haskell-status-icon", { dataset: { status: this.calcCurrentStatus() } }));
    }
    async update(props) {
        this.props.statusMap = props.statusMap;
        return etch.update(this);
    }
    async destroy() {
        await etch.destroy(this);
        this.props.statusMap.clear();
    }
    calcCurrentStatus() {
        const prio = {
            progress: 50,
            error: 20,
            warning: 10,
            ready: 0,
        };
        const stArr = Array.from(this.props.statusMap.values());
        if (stArr.length === 0)
            return 'ready';
        const [consensus] = stArr.sort((a, b) => prio[b.status] - prio[a.status]);
        return consensus.status;
    }
}
exports.StatusIcon = StatusIcon;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhdHVzLWljb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvb3V0cHV0LXBhbmVsL3ZpZXdzL3N0YXR1cy1pY29uLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDZCQUE0QjtBQUM1QiwrQkFBMEM7QUFTMUM7SUFHRSxZQUFtQixLQUFhO1FBQWIsVUFBSyxHQUFMLEtBQUssQ0FBUTtRQUM5QixJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksMEJBQW1CLEVBQUUsQ0FBQTtRQUU1QyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFBO1FBRXJCLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUNsQixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFO1lBQzlCLEtBQUssRUFBRSw0QkFBNEI7WUFDbkMsS0FBSyxFQUFFLEdBQUcsRUFBRTtnQkFDVixNQUFNLEdBQUcsR0FBRyxFQUFFLENBQUE7Z0JBQ2QsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUNULE1BQU0sRUFDTixFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsRUFDbkIsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUM7b0JBQ3BDLEdBQUcsQ0FBQyxJQUFJLENBQUM7O29EQUUrQixNQUFNLEtBQUssTUFBTTt5Q0FFdkQsTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQ3BCOztXQUVELENBQUMsQ0FBQTtnQkFDRixDQUFDO2dCQUNELE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFBO1lBQ3JCLENBQUM7U0FDRixDQUFDLENBQ0gsQ0FBQTtJQUNILENBQUM7SUFFTSxNQUFNO1FBQ1gsTUFBTSxDQUFDLENBQ0wsc0NBQXlCLE9BQU8sRUFBRSxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUMsaUJBQWlCLEVBQUUsRUFBRSxHQUFJLENBQzNFLENBQUE7SUFDSCxDQUFDO0lBRU0sS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFhO1FBRS9CLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQyxTQUFTLENBQUE7UUFDdEMsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUE7SUFDMUIsQ0FBQztJQUVNLEtBQUssQ0FBQyxPQUFPO1FBQ2xCLE1BQU0sSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQTtRQUN4QixJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsQ0FBQTtJQUM5QixDQUFDO0lBRU8saUJBQWlCO1FBQ3ZCLE1BQU0sSUFBSSxHQUFHO1lBQ1gsUUFBUSxFQUFFLEVBQUU7WUFDWixLQUFLLEVBQUUsRUFBRTtZQUNULE9BQU8sRUFBRSxFQUFFO1lBQ1gsS0FBSyxFQUFFLENBQUM7U0FDVCxDQUFBO1FBQ0QsTUFBTSxLQUFLLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFBO1FBQ3ZELEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDO1lBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQTtRQUN0QyxNQUFNLENBQUMsU0FBUyxDQUFDLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFBO1FBQ3pFLE1BQU0sQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFBO0lBQ3pCLENBQUM7Q0FDRjtBQTdERCxnQ0E2REMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBldGNoIGZyb20gJ2V0Y2gnXG5pbXBvcnQgeyBDb21wb3NpdGVEaXNwb3NhYmxlIH0gZnJvbSAnYXRvbSdcbmltcG9ydCAqIGFzIFVQSSBmcm9tICdhdG9tLWhhc2tlbGwtdXBpJ1xuXG5leHBvcnQgaW50ZXJmYWNlIElQcm9wcyBleHRlbmRzIEpTWC5Qcm9wcyB7XG4gIHN0YXR1c01hcDogTWFwPHN0cmluZywgVVBJLklTdGF0dXM+XG59XG5cbnR5cGUgRWxlbWVudENsYXNzID0gSlNYLkVsZW1lbnRDbGFzc1xuXG5leHBvcnQgY2xhc3MgU3RhdHVzSWNvbiBpbXBsZW1lbnRzIEVsZW1lbnRDbGFzcyB7XG4gIHByaXZhdGUgZGlzcG9zYWJsZXM6IENvbXBvc2l0ZURpc3Bvc2FibGVcbiAgcHJpdmF0ZSBlbGVtZW50ITogSFRNTEVsZW1lbnRcbiAgY29uc3RydWN0b3IocHVibGljIHByb3BzOiBJUHJvcHMpIHtcbiAgICB0aGlzLmRpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKVxuXG4gICAgZXRjaC5pbml0aWFsaXplKHRoaXMpXG5cbiAgICB0aGlzLmRpc3Bvc2FibGVzLmFkZChcbiAgICAgIGF0b20udG9vbHRpcHMuYWRkKHRoaXMuZWxlbWVudCwge1xuICAgICAgICBjbGFzczogJ2lkZS1oYXNrZWxsLXN0YXR1cy10b29sdGlwJyxcbiAgICAgICAgdGl0bGU6ICgpID0+IHtcbiAgICAgICAgICBjb25zdCByZXMgPSBbXVxuICAgICAgICAgIGZvciAoY29uc3QgW1xuICAgICAgICAgICAgcGx1Z2luLFxuICAgICAgICAgICAgeyBzdGF0dXMsIGRldGFpbCB9LFxuICAgICAgICAgIF0gb2YgdGhpcy5wcm9wcy5zdGF0dXNNYXAuZW50cmllcygpKSB7XG4gICAgICAgICAgICByZXMucHVzaChgXG4gICAgICAgICAgPGlkZS1oYXNrZWxsLXN0YXR1cy1pdGVtPlxuICAgICAgICAgICAgPGlkZS1oYXNrZWxsLXN0YXR1cy1pY29uIGRhdGEtc3RhdHVzPVwiJHtzdGF0dXN9XCI+JHtwbHVnaW59PC9pZGUtaGFza2VsbC1zdGF0dXMtaWNvbj5cbiAgICAgICAgICAgIDxpZGUtaGFza2VsbC1zdGF0dXMtZGV0YWlsPiR7XG4gICAgICAgICAgICAgIGRldGFpbCA/IGRldGFpbCA6ICcnXG4gICAgICAgICAgICB9PC9pZGUtaGFza2VsbC1zdGF0dXMtZGV0YWlsPlxuICAgICAgICAgIDwvaWRlLWhhc2tlbGwtc3RhdHVzLWl0ZW0+XG4gICAgICAgICAgYClcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHJlcy5qb2luKCcnKVxuICAgICAgICB9LFxuICAgICAgfSksXG4gICAgKVxuICB9XG5cbiAgcHVibGljIHJlbmRlcigpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPGlkZS1oYXNrZWxsLXN0YXR1cy1pY29uIGRhdGFzZXQ9e3sgc3RhdHVzOiB0aGlzLmNhbGNDdXJyZW50U3RhdHVzKCkgfX0gLz5cbiAgICApXG4gIH1cblxuICBwdWJsaWMgYXN5bmMgdXBkYXRlKHByb3BzOiBJUHJvcHMpIHtcbiAgICAvLyBUT0RPOiBEaWZmIGFsZ29cbiAgICB0aGlzLnByb3BzLnN0YXR1c01hcCA9IHByb3BzLnN0YXR1c01hcFxuICAgIHJldHVybiBldGNoLnVwZGF0ZSh0aGlzKVxuICB9XG5cbiAgcHVibGljIGFzeW5jIGRlc3Ryb3koKSB7XG4gICAgYXdhaXQgZXRjaC5kZXN0cm95KHRoaXMpXG4gICAgdGhpcy5wcm9wcy5zdGF0dXNNYXAuY2xlYXIoKVxuICB9XG5cbiAgcHJpdmF0ZSBjYWxjQ3VycmVudFN0YXR1cygpOiAncmVhZHknIHwgJ3dhcm5pbmcnIHwgJ2Vycm9yJyB8ICdwcm9ncmVzcycge1xuICAgIGNvbnN0IHByaW8gPSB7XG4gICAgICBwcm9ncmVzczogNTAsXG4gICAgICBlcnJvcjogMjAsXG4gICAgICB3YXJuaW5nOiAxMCxcbiAgICAgIHJlYWR5OiAwLFxuICAgIH1cbiAgICBjb25zdCBzdEFyciA9IEFycmF5LmZyb20odGhpcy5wcm9wcy5zdGF0dXNNYXAudmFsdWVzKCkpXG4gICAgaWYgKHN0QXJyLmxlbmd0aCA9PT0gMCkgcmV0dXJuICdyZWFkeSdcbiAgICBjb25zdCBbY29uc2Vuc3VzXSA9IHN0QXJyLnNvcnQoKGEsIGIpID0+IHByaW9bYi5zdGF0dXNdIC0gcHJpb1thLnN0YXR1c10pXG4gICAgcmV0dXJuIGNvbnNlbnN1cy5zdGF0dXNcbiAgfVxufVxuIl19