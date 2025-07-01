import React, { useState } from 'react';
import { CategoryHierarchy, CategoryInclusionSettings } from '../types';
import EditableCategoryName from './EditableCategoryName';

const PlusIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5" {...props}>
    <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
  </svg>
);

const TrashIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5" {...props}>
        <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.58.22-2.365.468a.75.75 0 1 0 .53 1.422a49.98 49.98 0 0 1 11.67 0a.75.75 0 1 0 .53-1.422A50.901 50.901 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z" clipRule="evenodd" />
    </svg>
);

const ArrowDownTrayIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5" {...props}>
    <path d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 0 0-1.09-1.03l-2.905 3.129V2.75Z" />
    <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
  </svg>
);

const ArrowUpTrayIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5" {...props}>
    <path d="M10.75 11.75a.75.75 0 0 0-1.5 0v-8.614L6.295 6.265a.75.75 0 1 0-1.09-1.03l4.25-4.5a.75.75 0 0 0 1.09 0l4.25 4.5a.75.75 0 0 0-1.09 1.03l-2.905-3.129v8.614Z" />
    <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
  </svg>
);


interface CategoryViewProps {
  categoryStructure: CategoryHierarchy;
  categoryInclusion: CategoryInclusionSettings;
  onCreate: (name: string) => void;
  onUpdate: (oldName: string, newName: string) => void;
  onDelete: (name: string) => void;
  onSetCategoryInclusion: (categoryName: string, include: boolean) => void;
  onExport: () => void;
  onImportClick: () => void;
}

const CategoryView: React.FC<CategoryViewProps> = ({ categoryStructure, categoryInclusion, onCreate, onUpdate, onDelete, onSetCategoryInclusion, onExport, onImportClick }) => {
  
  const handleAddParent = () => {
    const name = window.prompt("Enter new parent category name:");
    if (name && name.trim()) {
      onCreate(name.trim());
    }
  };
  
  const handleAddSubCategory = (parent: string) => {
    const name = window.prompt(`Enter new sub-category name for "${parent}":`);
    if (name && name.trim()) {
      onCreate(`${parent}:${name.trim()}`);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b pb-4">
        <h2 className="text-2xl font-semibold text-slate-800">Category Management</h2>
        <div className="flex flex-wrap items-center gap-3">
            <button onClick={onExport} className="flex items-center justify-center px-3 py-2 bg-slate-600 text-white rounded-md shadow hover:bg-slate-700 text-sm">
                <ArrowDownTrayIcon className="mr-2 h-4 w-4" /> Export
            </button>
            <button onClick={onImportClick} className="flex items-center justify-center px-3 py-2 bg-slate-600 text-white rounded-md shadow hover:bg-slate-700 text-sm">
                <ArrowUpTrayIcon className="mr-2 h-4 w-4" /> Import
            </button>
            <button onClick={handleAddParent} className="flex items-center justify-center px-3 py-2 bg-accent text-white rounded-md shadow hover:bg-emerald-600 text-sm">
              <PlusIcon className="mr-2 h-4 w-4" /> New Parent Category
            </button>
        </div>
      </div>
      
      {Object.keys(categoryStructure).length > 0 ? (
        <div className="space-y-4">
          {Object.entries(categoryStructure).sort(([a], [b]) => a.localeCompare(b)).map(([parent, children]) => (
            <div key={parent} className="p-4 border border-slate-200 rounded-lg bg-slate-50">
              <div className="flex justify-between items-center">
                <div className="flex-grow flex items-center gap-4">
                    <input 
                        type="checkbox"
                        className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary flex-shrink-0"
                        checked={categoryInclusion[parent] ?? true}
                        onChange={(e) => onSetCategoryInclusion(parent, e.target.checked)}
                        title="Include in monthly total"
                    />
                    <EditableCategoryName 
                        name={parent} 
                        onSave={(newName) => onUpdate(parent, newName)}
                        className="text-lg font-semibold text-primary"
                    />
                    <button onClick={() => handleAddSubCategory(parent)} className="text-xs text-green-600 hover:text-green-800 flex items-center">
                        <PlusIcon className="mr-1 h-4 w-4" /> Add Sub
                    </button>
                </div>
                <button onClick={() => onDelete(parent)} className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100">
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
              
              {children.length > 0 && (
                <div className="mt-3 pl-6 space-y-2 border-l-2 border-slate-200">
                  {children.map(child => {
                    const fullName = `${parent}:${child}`;
                    return (
                      <div key={fullName} className="flex justify-between items-center">
                        <div className="flex-grow flex items-center gap-3">
                           <input 
                                type="checkbox"
                                className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary flex-shrink-0"
                                checked={categoryInclusion[fullName] ?? true}
                                onChange={(e) => onSetCategoryInclusion(fullName, e.target.checked)}
                                title="Include in monthly total"
                            />
                            <EditableCategoryName 
                                name={child}
                                onSave={(newName) => onUpdate(fullName, `${parent}:${newName}`)}
                                className="text-sm text-slate-700"
                            />
                        </div>
                        <button onClick={() => onDelete(fullName)} className="text-slate-400 hover:text-red-600 p-1 rounded-full hover:bg-red-100">
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 border-2 border-dashed border-slate-300 rounded-lg">
          <svg className="mx-auto h-12 w-12 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.475-2.118a3.75 3.75 0 0 1 7.48-1.584a2.25 2.25 0 0 1 2.475 2.118Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255a2.25 2.25 0 0 1-2.25-2.25a2.25 2.25 0 0 0-4.5 0a2.25 2.25 0 0 1-2.25 2.25m-6.066-2.56a2.25 2.25 0 0 0-4.132-.872a2.25 2.25 0 0 1-2.475-2.118a3.75 3.75 0 0 1 7.48-1.584a2.25 2.25 0 0 1 2.475 2.118a2.25 2.25 0 0 0-4.132.872Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a8.25 8.25 0 0 0 6.066-13.442" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3.75a8.25 8.25 0 0 0-6.066 13.442" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-slate-900">No categories defined</h3>
          <p className="mt-1 text-sm text-slate-500">Get started by importing expenses or creating a new category.</p>
        </div>
      )}
    </div>
  );
};

export default CategoryView;