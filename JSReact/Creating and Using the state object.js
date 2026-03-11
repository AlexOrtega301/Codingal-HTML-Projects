import React from 'react'; 
import ReactDOM from 'react-dom';

class Student extends React.Component {
	constructor(props){
		super(props)
		this.state = {
			name: "Alex",
			grade: 8,
			favorite_color: "red",
			favorite_subject: "computer software",
            what_do_i_want_to_be: "a software developer"
		};
	}
	render() {
		return(
			<div>
			<h1>Programmer Details</h1>
			<p>My name is {this.state.name}</p>
			<p>I am in grade {this.state.grade}</p>
			<p>My favorite colour is {this.state.favorite_color}</p>
			<p>My favorite subject is {this.state.favorite_subject}</p>
            <p>When I grow up, I want to be {this.state.what_do_i_want_to_be}</p>
            </div>
		)
	}
}

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(<Student />);
