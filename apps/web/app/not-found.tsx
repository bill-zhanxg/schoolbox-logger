import { ErrorMessage } from './globalComponents/ErrorMessage';

export default function NotFound() {
	return <ErrorMessage code="404" message="Not Found" />;
}
