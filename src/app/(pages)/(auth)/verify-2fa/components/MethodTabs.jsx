import React from "react";

const MethodTabs = ({ tabs, activeTab, setActiveTab }) => {
  return (
    <div className="flex border-b border-base-300/50">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex-1 py-3 text-center font-semibold flex items-center justify-center gap-2 transition-all
            ${
              activeTab === tab.id
                ? "border-b-2 border-warning text-warning"
                : "text-base-content/60 hover:text-base-content"
            }
          `}
        >
          <tab.icon className="w-4 h-4" />
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default MethodTabs;
