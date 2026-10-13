import { createFileRoute } from '@tanstack/react-router';
import { PsychrometricsPage } from '@workspace/psychrometrics-ui';

const Psychrometrics = () => {
  const { siteId } = Route.useParams();
  const navigate = Route.useNavigate();

  return (
    <PsychrometricsPage
      siteId={siteId}
      onSiteChange={next => navigate({ params: { siteId: next }, replace: true })}
    />
  );
};

export const Route = createFileRoute('/_app-shell/$siteId')({
  component: Psychrometrics
});
