import { azure } from './actions';
import { Test } from './components/Test';

export default function LogData() {
	return (
		<div className="container">
			<h1>Log Data</h1>
			<form action={azure}>
				<input type="text" name="azure-token" placeholder="azure-token" />
				<input type="text" name="schoolbox-domain" placeholder="schoolbox-domain" />
				<input type="text" name="schoolbox-cookie" placeholder="schoolbox-cookie" />
				<button className="btn">test</button>
			</form>
			<Test />
		</div>
	);
}
