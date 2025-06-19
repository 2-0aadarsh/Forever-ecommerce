const NewsletterBox = () => {
  const onSubmitHandler = (event) => {
    event.preventDefault();
    // Handle newsletter subscription logic here
  };

  return (
    <div className="bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 text-center rounded-xl shadow-sm">
      <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800">
        Join Our Newsletter & Get <span className="text-gray-700">20% Off</span>
      </h2>
      <p className="mt-3 text-sm sm:text-base text-gray-600 max-w-xl mx-auto">
        Stay updated with our latest collections, offers, and more. Subscribe
        now and never miss out!
      </p>

      <form
        onSubmit={onSubmitHandler}
        className="mt-6 flex flex-col sm:flex-row items-center gap-3 max-w-xl mx-auto"
      >
        <input
          type="email"
          required
          placeholder="Enter your email address"
          className="w-full flex-1 px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
        />
        <button
          type="submit"
          className="px-6 py-3 bg-gray-800 text-white text-sm font-medium rounded-md hover:bg-gray-900 transition duration-300"
        >
          Subscribe
        </button>
      </form>
    </div>
  );
};

export default NewsletterBox;
