import React from 'react';

const AdPlaceholder: React.FC<{ height: string }> = ({ height }) => (
  <div
    className={`w-full ${height} bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 rounded-lg`}
  >
    <span className="text-sm">Advertisement</span>
  </div>
);


const Aside: React.FC = () => {
  return (
    <aside className="hidden lg:block col-span-3 py-8 pr-4">
      <div className="sticky top-24 space-y-8">
        <h2 className="text-xl font-bold border-b-2 border-gray-200 dark:border-gray-700 pb-2 text-gray-900 dark:text-white">Sponsored</h2>
        <AdPlaceholder height="h-64" />
        <AdPlaceholder height="h-48" />
        <AdPlaceholder height="h-48" />
      </div>
    </aside>
  );
};

export default Aside;
