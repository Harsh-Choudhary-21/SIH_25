import React from 'react';
import { motion } from 'framer-motion';
import { TreePine, MapPin, FileText } from 'lucide-react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center z-50">
      <div className="text-center">
        {/* Logo Animation */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-8"
        >
          <div className="relative">
            <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144" fill="none" className='mx-auto'>
            
            <path d="M29.8017 119.689C25.967 115.855 22.9631 111.423 20.79 106.395C18.617 101.368 17.5304 96.1694 17.5304 90.8007C17.5304 85.432 18.5531 80.1272 20.5983 74.8863C22.6435 69.6455 25.967 64.7241 30.5687 60.1224C33.5513 57.1398 37.237 54.5833 41.6257 52.4528C46.0144 50.3224 51.2126 48.6394 57.2204 47.4037C63.2283 46.1681 70.0883 45.4224 77.8004 45.1668C85.5126 44.9111 94.1409 45.2094 103.685 46.0615C104.367 55.0946 104.58 63.4033 104.324 70.9876C104.069 78.572 103.366 85.4107 102.215 91.5037C101.065 97.5968 99.4457 102.923 97.3578 107.482C95.27 112.041 92.6922 115.855 89.6244 118.922C85.1078 123.439 80.3144 126.741 75.2439 128.829C70.1735 130.917 64.9965 131.961 59.7131 131.961C54.1739 131.961 48.7626 130.874 43.4791 128.701C38.1957 126.528 33.6365 123.524 29.8017 119.689ZM44.1183 117.644C46.5896 119.093 49.1248 120.137 51.7239 120.776C54.3231 121.415 56.9861 121.735 59.7131 121.735C63.6331 121.735 67.5104 120.946 71.3452 119.37C75.18 117.793 78.8444 115.258 82.3383 111.764C83.8722 110.23 85.4274 108.078 87.0039 105.309C88.5804 102.539 89.9439 98.9176 91.0944 94.4437C92.2448 89.9698 93.1183 84.5585 93.7148 78.2098C94.3113 71.8611 94.3965 64.2981 93.9704 55.5207C89.7948 55.3502 85.0865 55.2863 79.8457 55.3289C74.6048 55.3715 69.3852 55.7763 64.187 56.5433C58.9887 57.3102 54.0461 58.5459 49.3591 60.2502C44.6722 61.9546 40.8374 64.2981 37.8548 67.2807C34.02 71.1155 31.3783 74.9076 29.9296 78.6572C28.4809 82.4068 27.7565 86.0285 27.7565 89.5224C27.7565 94.5502 28.7152 98.9602 30.6326 102.752C32.55 106.545 34.2331 109.208 35.6817 110.742C39.2609 103.924 43.9904 97.3837 49.8704 91.1202C55.7504 84.8568 62.6104 79.7224 70.4504 75.7172C64.3148 81.0859 58.9674 87.1576 54.4083 93.9324C49.8491 100.707 46.4191 108.611 44.1183 117.644Z" fill="#1F892C" />
          </svg>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="absolute -top-2 -right-2"
            >
              <MapPin className="h-8 w-8 text-blue-600" />
            </motion.div>
          </div>
        </motion.div>

        {/* Welcome Text */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-4xl font-bold text-gray-800 dark:text-white mb-4"
        >
          Welcome to FRA Atlas
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-lg text-gray-600 dark:text-gray-300 mb-8"
        >
          AI-powered Forest Rights Act Decision Support System
        </motion.p>

        {/* Loading Animation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="flex justify-center space-x-2"
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
              }}
              className="w-3 h-3 bg-green-600 rounded-full"
            />
          ))}
        </motion.div>

        {/* Features Preview */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="mt-12 flex justify-center space-x-8"
        >
          {[
            { icon: FileText, label: "Document Processing" },
            { icon: MapPin, label: "Interactive Maps" },
            { icon: TreePine, label: "Forest Rights" },
          ].map((feature, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05 }}
              className="text-center"
            >
              <feature.icon className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400">{feature.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default LoadingScreen;