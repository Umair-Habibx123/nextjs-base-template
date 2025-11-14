"use client";

import React from "react";
import LayoutRow from "../layouts/LayoutRow";
import ElementRenderer from "../elements/ElementRenderer";

const EditorCanvas = ({
  canvasItems,
  layoutRows,
  onDragOver,
  onDrop,
  onColumnDrop,
  onElementDelete,
  onElementUpdate,
  onColumnDelete,
  onItemUpdate,
  onItemDelete,
  onElementSelect,
  selectedDevice = "Desktop",
  onSendTestEmail,
  onSaveTemplate,
  lastSaved,
  selectedElement,
  selectedTemplate,
  hideSaveButton = false,
  hideTestButton = false,
}) => {
  return (
    <div className="flex-1 bg-base-200 p-6 overflow-y-auto">
      {/* 🧭 HEADER — stays full width */}
      <div className="card bg-base-100 shadow-sm mb-6 border border-base-300">
        <div className="card-body p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          {/* LEFT SIDE: Info */}
          <div>
            <h2 className="card-title text-xl font-semibold text-base-content flex items-center">
              Canvas
              <span className="ml-2 text-sm font-normal text-base-content/70">
                ({selectedDevice} view)
              </span>
            </h2>
            <p className="text-sm text-base-content/70 mt-1">
              {selectedTemplate ? (
                <>
                  Editing:{" "}
                  <span className="font-medium text-primary">
                    {selectedTemplate.name}
                  </span>
                </>
              ) : (
                "No template selected"
              )}
            </p>
          </div>

          {/* RIGHT SIDE: Buttons */}
          <div className="flex flex-wrap items-center gap-3 mt-4 sm:mt-0">
            {/* {!hideTestButton && (
              <button
                onClick={onSendTestEmail}
                className="btn btn-outline btn-primary btn-sm"
                disabled={!selectedTemplate}
              >
                Send Test Email
              </button>
            )} */}

            {!hideSaveButton && (
              <button
                onClick={onSaveTemplate}
                className="btn btn-primary btn-sm"
                disabled={!selectedTemplate}
              >
                Save Template
              </button>
            )}

            {lastSaved && !hideSaveButton && (
              <div className="text-xs text-base-content/60">
                Last saved: {new Date(lastSaved).toLocaleTimeString()}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ✨ RESPONSIVE CANVAS AREA (view switch applies here only) */}
      <div
        className={`mx-auto transition-all duration-300 ${
          selectedDevice === "Mobile" ? "max-w-sm" : "max-w-full"
        }`}
      >
        {/* DROP ZONE */}
        <div
          className="card bg-base-100 border border-dashed border-base-300 shadow-sm p-8 min-h-[600px] transition-all duration-300 hover:border-primary/60"
          onDragOver={onDragOver}
          onDrop={onDrop}
          title="Drop elements here to build your email template"
        >
          {canvasItems.length === 0 && layoutRows.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <div className="text-6xl animate-bounce">📧</div>
              <h3 className="text-lg font-medium text-base-content">
                Drop Zone
              </h3>
              <p className="text-base-content/70">
                Drag and drop elements here to build your email template
              </p>
              <div className="flex items-center justify-center space-x-2 text-sm text-primary">
                <span className="badge badge-primary badge-xs animate-pulse"></span>
                <span>Drag elements from the left sidebar</span>
                <span className="badge badge-primary badge-xs animate-pulse"></span>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Layout Rows */}
              {layoutRows.map((row, rowIndex) => (
                <LayoutRow
                  key={row.id}
                  rowId={row.id}
                  rowIndex={rowIndex}
                  columns={row.columns}
                  elements={row.elements}
                  columnProperties={row.columnProperties}
                  onColumnDrop={onColumnDrop}
                  onElementDelete={onElementDelete}
                  onElementUpdate={onElementUpdate}
                  onColumnDelete={onColumnDelete}
                  onElementSelect={onElementSelect}
                  selectedElement={selectedElement}
                />
              ))}

              {/* Standalone Canvas Items */}
              {canvasItems.map((item, itemIndex) => (
                <div
                  key={`${item.id}-${item.content ? item.content.length : 0}`}
                  className="relative"
                >
                  {/* Drop zone above */}
                  <div
                    className="h-8 -mt-4 flex items-center justify-center border-2 border-dashed border-base-300 rounded opacity-30 hover:opacity-100 cursor-pointer transition-opacity duration-200"
                    onDragOver={onDragOver}
                    onDrop={(e) => onDrop(e, itemIndex, "above")}
                    title="Drop here to insert above"
                  >
                    <span className="text-xs text-base-content/50">↑</span>
                  </div>

                  <div className="flex items-start gap-4">
                    {/* Left drop zone */}
                    <div
                      className="w-16 flex items-center justify-center border-2 border-dashed border-base-300 rounded opacity-30 hover:opacity-100 cursor-pointer transition-opacity duration-200"
                      onDragOver={onDragOver}
                      onDrop={(e) => onDrop(e, itemIndex, "left")}
                      title="Drop here to insert on the left"
                    >
                      <span className="text-xs text-base-content/50">←</span>
                    </div>

                    {/* Element */}
                    <div className="flex-1">
                      <ElementRenderer
                        type={item.name}
                        id={item.id}
                        initialContent={item.content}
                        fontSize={item.fontSize}
                        color={item.color}
                        backgroundColor={item.backgroundColor}
                        buttonColor={item.buttonColor}
                        buttonShape={item.buttonShape}
                        buttonUrl={item.buttonUrl}
                        imageWidth={item.imageWidth}
                        imageHeight={item.imageHeight}
                        objectFit={item.objectFit}
                        borderRadius={item.borderRadius}
                        dividerStyle={item.dividerStyle}
                        alignment={item.alignment || "left"}
                        fontStyles={item.fontStyles || []}
                        socialIcon={item.socialIcon}
                        socialUrl={item.socialUrl}
                        socialColor={item.socialColor}
                        socialSize={item.socialSize}
                        padding={item.padding}
                        paddingTop={item.paddingTop}
                        paddingRight={item.paddingRight}
                        paddingBottom={item.paddingBottom}
                        paddingLeft={item.paddingLeft}
                        onUpdate={onItemUpdate}
                        onDelete={onItemDelete}
                        onSelect={(element) =>
                          onElementSelect(
                            {
                              ...element,
                              alignment: element.alignment || "left",
                            },
                            "canvas"
                          )
                        }
                        isSelected={
                          selectedElement && selectedElement.id === item.id
                        }
                      />
                    </div>

                    {/* Right drop zone */}
                    <div
                      className="w-16 flex items-center justify-center border-2 border-dashed border-base-300 rounded opacity-30 hover:opacity-100 cursor-pointer transition-opacity duration-200"
                      onDragOver={onDragOver}
                      onDrop={(e) => onDrop(e, itemIndex, "right")}
                      title="Drop here to insert on the right"
                    >
                      <span className="text-xs text-base-content/50">→</span>
                    </div>
                  </div>

                  {/* Drop zone below */}
                  <div
                    className="h-8 -mb-4 flex items-center justify-center border-2 border-dashed border-base-300 rounded opacity-30 hover:opacity-100 cursor-pointer transition-opacity duration-200"
                    onDragOver={onDragOver}
                    onDrop={(e) => onDrop(e, itemIndex, "below")}
                    title="Drop here to insert below"
                  >
                    <span className="text-xs text-base-content/50">↓</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditorCanvas;
