import { CreditCard } from "lucide-react";
import ComingSoon from "../../components/ComingSoon";

const AccountsPage: React.FC = () => {
  return (
    <ComingSoon
      title="Accounts"
      description="Manage system accounts"
      icon={CreditCard}
    />
  );
};

export default AccountsPage;
