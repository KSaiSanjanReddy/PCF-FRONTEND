import { MessageCircle } from "lucide-react";
import ComingSoon from "../../components/ComingSoon";

const WhatsAppPage: React.FC = () => {
  return (
    <ComingSoon
      title="WhatsApp"
      description="Configure WhatsApp integration"
      icon={MessageCircle}
    />
  );
};

export default WhatsAppPage;
