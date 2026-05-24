import ErrorPage from '@/components/error-page';
import BackendLayout from '@/layouts/backend-layout';
import { type ReactNode } from 'react';

interface Props {
    message?: string;
}

function BackendError500({ message }: Props) {
    return <ErrorPage context="backend" status={500} message={message} />;
}

BackendError500.layout = (page: ReactNode) => <BackendLayout>{page}</BackendLayout>;

export default BackendError500;
