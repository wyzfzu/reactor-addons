'use strict';

import React         from 'react';
import DocumentTitle from 'react-document-title';
import StreamGraph           from '../components/StreamGraph';
import Rx            from 'rx-lite';


class Streams extends React.Component {

    constructor(props) {
        super(props);
        var graphControls = new Rx.Subject();
        this.graphControls = graphControls;

        this.systemDisposable = this.props.systemStream.flatMap(json => Rx.Observable.from(json.threads).filter(json => json.contextHash !== undefined)).subscribe(json => {
            graphControls.onNext({type: 'context', id: json.contextHash, state: json.state });
        });

        this.logDisposable = this.props.logStream.filter(json => json.origin !== undefined).subscribe(json => {
            graphControls.onNext({type: 'log', id: json.origin, message: json.message, level: json.level, kind: json.kind });
        });
    }

    componentDidUpdate() {
        //this.draw();
    }

    componentWillUnmount() {
        if(this.systemDisposable != null){
            this.systemDisposable.dispose();
        }
        if(this.logDisposable != null){
            this.logDisposable.dispose();
        }
    }

    render() {
        return (
            <DocumentTitle title="Reactor Console • Streams">
                <section className="streams">
                    <div className="section-heading">Stream Monitor <a className="btn btn-primary pull-right" onClick={ e => this.graphControls.onNext({type: 'reset'})}>Reset</a></div>

                    <StreamGraph fullscreen={true}
                                 commands={this.props.nexusObserver}
                                 controlBus={this.graphControls}
                                 streams={this.props.graphStream.map(json => json.type == 'RemovedGraphEvent' ? json : json.streams)} />
                </section>
            </DocumentTitle>
        );
    }

}

export default Streams;