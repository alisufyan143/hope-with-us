import { Link } from "react-router-dom";

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-blue-600 text-white">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Make a Difference Today
            </h1>
            <p className="text-xl mb-8">
              Join our community and help those in need. Your donation can
              change lives.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/login"
                className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-md font-medium text-lg"
              >
                Donate Now
              </Link>
              <Link
                to="/register"
                className="bg-transparent hover:bg-blue-700 border border-white px-6 py-3 rounded-md font-medium text-lg"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Causes */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          Featured Causes
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* These would be populated dynamically from your API */}
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="h-48 bg-gray-200"></div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">
                  Donation Campaign {item}
                </h3>
                <p className="text-gray-600 mb-4">
                  This is a placeholder for a donation campaign description. In
                  a real application, this would be populated with actual data
                  from your backend.
                </p>
                <div className="mb-4">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full"
                      style={{ width: `${item * 25}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span>${item * 5000} raised</span>
                    <span>${item * 7500} goal</span>
                  </div>
                </div>
                <Link
                  to={`/donations/${item}`}
                  className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md"
                >
                  Donate Now
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-gray-100 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-bold mb-2">Create an Account</h3>
              <p className="text-gray-600">
                Sign up to become part of our community and start your journey.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-bold mb-2">Choose a Cause</h3>
              <p className="text-gray-600">
                Browse through verified donation campaigns and find causes you
                care about.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-bold mb-2">Make a Difference</h3>
              <p className="text-gray-600">
                Donate to your chosen cause and help create positive change.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-blue-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of donors who are changing lives through their
            contributions.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/donations"
              className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-md font-medium text-lg"
            >
              Donate Now
            </Link>
            <Link
              to="/register"
              className="bg-transparent hover:bg-blue-700 border border-white px-6 py-3 rounded-md font-medium text-lg"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
