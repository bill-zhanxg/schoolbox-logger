import { ErrorMessage } from './ErrorMessage';

export function Unauthorized() {
	return <ErrorMessage code="401" message="Unauthorized" />;
}
