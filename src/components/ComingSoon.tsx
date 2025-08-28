import type { LucideIcon } from "lucide-react";

interface ComingSoonProps {
  title: string;
  description: string;
  icon: LucideIcon;
  className?: string;
}

const ComingSoon: React.FC<ComingSoonProps> = ({
  title,
  description,
  icon: Icon,
  className = "",
}) => {
  return (
    <div className={`space-y-6 ${className}`}>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <p className="text-gray-600">{description}</p>
      </div>

      <div className="bg-white rounded-lg shadow p-8 text-center">
        <Icon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600">Coming soon...</p>
      </div>
    </div>
  );
};

export default ComingSoon;
