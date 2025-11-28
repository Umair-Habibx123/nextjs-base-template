// "use client";
// import React from "react";
// import { Eye, Save, Trash2, Pencil, Palette, EyeOff } from "lucide-react";

// const ThemeManagerGrid = ({
//   availableThemes,
//   visibleThemes,
//   toggleVisibility,
//   setPreviewTheme,
//   saveTheme,
//   deleteTheme,
//   t,
//   setEditingTheme,
// }) => {
//   return (
//     <div className="bg-linear-to-br from-base-100 to-base-200 border border-base-300/30 rounded-2xl p-6 shadow-lg backdrop-blur-lg">
//       <div className="flex items-center gap-3 mb-6">
//         <Palette className="w-6 h-6 text-primary" />
//         <h3 className="text-xl font-bold bg-linear-to-r from-base-content to-base-content/80 bg-clip-text text-transparent">
//           {t("All Themes")}
//         </h3>
//         <span className="badge badge-primary badge-lg font-semibold">
//           {availableThemes.length}
//         </span>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
//         {availableThemes.map((name) => (
//           <div
//             key={name}
//             className="group p-5 rounded-xl bg-base-100 border border-base-300/40 
//             shadow-md hover:shadow-2xl transition-all duration-300 hover:border-primary/30
//             backdrop-blur-md hover:scale-[1.02]"
//           >
//             <div className="flex justify-between items-start mb-3">
//               <div>
//                 <span className="font-bold text-base-content text-lg capitalize">
//                   {name}
//                 </span>
//                 <div className="flex items-center gap-2 mt-1">
//                   <span className={`badge badge-sm ${name === "light" || name === "dark" ? "badge-secondary" : "badge-primary"}`}>
//                     {name === "light" || name === "dark" ? "System" : "Custom"}
//                   </span>
//                 </div>
//               </div>

//               <div className="flex gap-1">
//                 <button
//                   className="btn btn-square btn-sm btn-outline hover:btn-info hover:text-info-content transition-all"
//                   onClick={() => {
//                     setPreviewTheme(name);
//                     if (["light", "dark"].includes(name)) {
//                       setEditingTheme(null);
//                     }
//                   }}
//                   title={t("Preview")}
//                 >
//                   <Eye className="w-4 h-4" />
//                 </button>

//                 {!["light", "dark"].includes(name) && (
//                   <>
//                     <button
//                       className="btn btn-square btn-sm btn-outline hover:btn-warning hover:text-warning-content transition-all"
//                       onClick={() => { setEditingTheme(name); setPreviewTheme(name); }}
//                       title={t("Edit")}
//                     >
//                       <Pencil className="w-4 h-4" />
//                     </button>
//                     <button
//                       className="btn btn-square btn-sm btn-outline hover:btn-success hover:text-success-content transition-all"
//                       onClick={() => saveTheme(name)}
//                       title={t("Save")}
//                     >
//                       <Save className="w-4 h-4" />
//                     </button>
//                     <button
//                       className="btn btn-square btn-sm btn-outline hover:btn-error hover:text-error-content transition-all"
//                       onClick={() => deleteTheme(name)}
//                       title={t("Delete")}
//                     >
//                       <Trash2 className="w-4 h-4" />
//                     </button>
//                   </>
//                 )}
//               </div>
//             </div>

//             {!["light", "dark"].includes(name) && (
//               <div className="flex items-center justify-between pt-3 border-t border-base-300/30">
//                 <span className="text-sm font-medium text-base-content/70">
//                   {t("Visible in switcher")}
//                 </span>
//                 <label className="cursor-pointer">
//                   <input
//                     type="checkbox"
//                     checked={visibleThemes[name] ?? true}
//                     onChange={() => toggleVisibility(name)}
//                     className="toggle toggle-primary toggle-sm"
//                   />
//                 </label>
//               </div>
//             )}
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default ThemeManagerGrid;