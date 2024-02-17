import { chunk } from '@/libs/formatValue';
import { getXataClient } from '@/libs/xata';
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
			<form
				action={async () => {
					'use server';
					const xata = getXataClient();

					const allPortraits = (await xata.db.portraits.select(['id']).getAll()).map((portrait) => portrait.id);
					const allPortraitLogs = (await xata.db.portrait_logs.select(['id']).getAll()).map((portrait) => portrait.id);
					const chunks = chunk(allPortraits);
					for (const chunk of chunks)
						await xata.transactions.run(
							chunk.map((id) => ({
								delete: {
									table: 'portraits',
									id,
								},
							})),
						);
					console.log('removed all portraits, removing portrait logs');
					const chunks2 = chunk(allPortraitLogs);
					for (const chunk of chunks2)
						await xata.transactions.run(
							chunk.map((id) => ({
								delete: {
									table: 'portrait_logs',
									id,
								},
							})),
						);
					console.log('removed all portrait logs');
				}}
			>
				<button className="btn">test</button>
			</form>
			<Test />
		</div>
	);
}
