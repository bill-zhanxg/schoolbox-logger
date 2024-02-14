import { azure } from './actions';

export default function LogData() {
	return (
		<div className="container">
			<h1>Log Data</h1>
			<form action={azure}>
				<input type="text" name="azure-token" placeholder='azure-token' />
				<input type="text" name="schoolbox-domain" placeholder='schoolbox-domain' />
				<input type="text" name="schoolbox-token" placeholder='schoolbox-token' />
				<button className="btn">test</button>
			</form>
		</div>
	);
}
