import React from "react";
import { connect } from "react-redux";
@connect()
class User extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    console.log(_newActions, "window");
    const result = _newActions["admin/fetch"]({ payload: 1 });
    console.log(result);
    this.props.dispatch(result);
  }

  render() {
    return <div>ss333s</div>;
  }
}

export default User;
