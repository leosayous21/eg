
class Connections extends React.Component {
  render() {
    const connections = this.props.connections;
    const devices = Object.keys(connections);
    const connectionsRender = devices.map(device => {
      const color = connections[device] ? 'success' : 'danger';
      const className=`badge badge-${color}`
      return (
      <a className="nav-item" href="#" key={device}>
        <span className={className}>{device}</span>
      </a>)
    });
    return (
      <div className="navbar-nav">
        {connectionsRender}
      </div>
    )
  }
}

socket.on('connections', connections =>
  ReactDOM.render(
    <Connections connections={connections}/>,
    document.getElementById('navbar-connections')
  )
)

class Main extends React.Component {
  render() {
  const flows = this.props.flowList.map(flow => (<Flow key={flow.description} flow={flow}/>));
  return (<div>{flows}</div>);
  }
}

class Response extends React.Component {
  render() {
    const response = this.props.response;
    console.log('response', response);
    if(response.type !== 'crea') return null;
    if(!response.hasData) return (<div>pas de reponse</div>)
    const src=`crea-audio/${response.deviceName}_${response.index}`;
    const duration = Math.round(response.duration/10)/100;
    return (
    <div>
      <p>{duration}s <audio controls src={src}></audio></p>
    </div>
    )
  }
}

class Action extends React.Component {
  computeState(state) {
    if (state === 'pending') {
      return {badge: 'secondary', text: 'en attente'};
    } else if (state === 'started') {
      return {badge: 'warning', text: 'en cours'};
    } else if (state === 'finished') {
      return {badge: 'success', text: 'finis'};
    }
  }

  render() {
    const action = this.props.action;
    if(typeof action.type != "undefined") return (<Flow flow={action}/>);
    const state = this.computeState(action.state || 'pending');
    const emit = () => socket.emit();
    const hashes = action.description.split('#');
    let button;
    if(hashes.length > 1) {
      const [type, message, text] = hashes[1].split(';');
      button = (<span 
        className="badge badge-primary" 
        style={{cursor: "pointer"}}
        onClick={() => socket.emit(message)}>
        {text} </span>);
    }
    const description = hashes[0];
    const className = `badge badge-${state.badge}`;
    const stateBadge = <span className={className}>{state.text}</span>
    const response = action.response ? <Response response={action.response}/> : null;
    return (
      <div><p className="card-text" style={{margin: 0}}>
      {stateBadge} {description} {button} </p>
      {response}</div>
    );
  }
}
class Flow extends React.Component {
  render() {
    const flow = this.props.flow;
    const actions = flow.actions.map(action => <Action key={action.description} type={flow.type} action={action}/>);
    if(flow.type==='parallel') {
    return (
    <div>
      <p className="card-text" style={{margin: 0}}>{flow.description}</p>
      <div className='row'>
        {actions}
      </div>
    </div>
      );
    }
    return (
      <div className="card">
        <div className="card-header">
          {flow.description}
        </div>
        <div className='card-body'>
          {actions}
        </div>
      </div>
    )
  }
}

const launchSocket = () => {
  socket.emit('identification', 'interface');
  socket.emit('start-admin');
}
socket.on('connect', () => launchSocket());
launchSocket();
socket.on('mainFlow', mainFlow => {
  console.log('mainFlow', mainFlow);
  ReactDOM.render(<Main flowList={mainFlow}/>,
    document.getElementById('main')
  )
});
