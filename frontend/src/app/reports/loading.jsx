import PortalLoader from '../../components/PortalLoader';

export default function ReportsLoading() {
  return (
    <PortalLoader
      size="md"
      py="py-32"
      text="डेटा लोड होत आहे, कृपया प्रतीक्षा करा..."
    />
  );
}
