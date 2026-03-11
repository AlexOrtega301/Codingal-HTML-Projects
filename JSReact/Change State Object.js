import React from 'react';
import ReactDOM from 'react-dom/client';

class Student extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: "Alex",
      grade: 8,
      favorite_color: "Red",
      favorite_subject: "Computer Science"
    };
  }

  favoriteColor = () => {
    this.setState({ favorite_color: "black" });
  }

  render() {
    return (
      <div style={{ textAlign: "center", marginTop: "30px" }}>
        <h1>Programmer Details</h1>
        <p>My name is {this.state.name}</p>
        <p>I am in grade {this.state.grade}</p>
        <p>My favorite colour is {this.state.favorite_color}</p>
        <p>My favorite subject is {this.state.favorite_subject}</p>
        <button type="button" onClick={this.favoriteColor}>
          Click me
        </button>
      </div>
    );
  }
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Student />);
