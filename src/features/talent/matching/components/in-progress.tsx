import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function InProgress() {
  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-md p-8 shadow-lg bg-primary">
          <motion.div
            className="flex justify-center"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.8, 1, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full bg-indigo-200 animate-ping" />
              <div className="relative flex items-center justify-center w-full h-full rounded-full bg-indigo-300">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-center space-y-3"
          >
            <h1 className="text-2xl font-bold text-white">
              AI Matching in Progress
            </h1>
            <p className="text-gray-200">
              Scanning thousands of opportunities across the market...
            </p>
          </motion.div>

          <motion.div
            className="flex justify-center gap-2"
            animate={{
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <div className="w-2 h-2 rounded-full bg-gray-200" />
            <div className="w-2 h-2 rounded-full bg-gray-200" />
            <div className="w-2 h-2 rounded-full bg-gray-200" />
          </motion.div>
        </Card>
      </motion.div>
    </div>
  );
}
