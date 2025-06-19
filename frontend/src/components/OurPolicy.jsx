import { assets } from "../assets/assets";

const policies = [
  {
    icon: assets.exchange_icon,
    title: "Easy Exchange Policy",
    description: "Hassle-free product exchange within a few clicks.",
  },
  {
    icon: assets.quality_icon,
    title: "7 Days Return Policy",
    description: "Return products easily within 7 days of delivery.",
  },
  {
    icon: assets.support_img,
    title: "24/7 Customer Support",
    description: "Reach out to us anytime, we're here to help.",
  },
];

const OurPolicy = () => {
  return (
    <div className="py-16 px-4 md:px-8 bg-white">
      <div className="max-w-6xl mx-auto text-center mb-12">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
          Why Shop With Us?
        </h2>
        <p className="mt-2 text-sm md:text-base text-gray-500">
          We are committed to making your shopping experience smooth and
          satisfying.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {policies.map((policy, index) => (
          <div
            key={index}
            className="flex flex-col items-center p-6 bg-gray-50 border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition duration-300"
          >
            <img
              src={policy.icon}
              alt={policy.title}
              className="w-14 h-14 mb-4"
            />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {policy.title}
            </h3>
            <p className="text-sm text-gray-600 text-center">
              {policy.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OurPolicy;
