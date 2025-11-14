"use client";

import { useState } from "react";
import ElementRenderer from "../elements/ElementRenderer";

const ColumnDropZone = ({
  columnId,
  rowId,
  onDrop,
  columnNumber,
  onElementDelete,
  onElementUpdate,
  onColumnDelete,
  onElementSelect,
  elements,
  selectedElement,
  columnProperties = {},
}) => {
  const [isSelected, setIsSelected] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "copy";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onDrop(columnId, e);
  };

  const handleColumnClick = (e) => {
    if (e.target === e.currentTarget) {
      setIsSelected(!isSelected);
      if (onElementSelect) {
        onElementSelect(
          {
            id: columnId,
            name: "Column",
            columnId,
            rowId,
            backgroundColor: columnProperties?.backgroundColor || "#ffffff",
          },
          "column-background"
        );
      }
    }
  };

  const columnElements = (elements && elements[columnId]) || [];

  return (
    <div
      data-column-dropzone="true"
      className={`flex-1 min-h-[200px] border-2 border-dashed rounded-lg p-4 transition-all duration-300 cursor-pointer relative ${
        isSelected
          ? "ring-2 ring-primary border-primary/60 bg-base-100"
          : "border-base-300 hover:border-primary/40 bg-base-100"
      }`}
      style={{
        backgroundColor: columnProperties?.backgroundColor || "#ffffff",
      }}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleColumnClick}
      title="Click to select or drop elements here"
    >
      {/* Column number */}
      <div className="absolute top-2 left-3 text-xs font-medium text-base-content/50 select-none">
        #{columnNumber}
      </div>

      {/* Column delete button */}
      {onColumnDelete && isSelected && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onColumnDelete(columnId);
          }}
          className="btn btn-error btn-xs absolute top-2 right-2 rounded-full shadow-sm tooltip tooltip-left"
          data-tip="Delete column"
        >
          ✕
        </button>
      )}

      {/* Elements */}
      {columnElements.length > 0 ? (
        <div className="space-y-3">
          {columnElements.map((element, index) => (
            <div
              key={`${element.id ?? index}-${element.content?.length ?? 0}`}
              className="relative group"
            >
              <ElementRenderer
                type={element.name}
                id={element.id}
                initialContent={element.content}
                fontSize={element.fontSize}
                color={element.color}
                backgroundColor={element.backgroundColor}
                buttonColor={element.buttonColor}
                buttonShape={element.buttonShape}
                buttonUrl={element.buttonUrl}
                imageWidth={element.imageWidth}
                imageHeight={element.imageHeight}
                objectFit={element.objectFit}
                borderRadius={element.borderRadius}
                dividerStyle={element.dividerStyle}
                alignment={element.alignment || "left"}
                fontStyles={element.fontStyles || []}
                fontFamily={element.fontFamily || ""}
                socialIcon={element.socialIcon}
                socialUrl={element.socialUrl}
                socialColor={element.socialColor}
                socialSize={element.socialSize}
                padding={element.padding}
                paddingTop={element.paddingTop}
                paddingRight={element.paddingRight}
                paddingBottom={element.paddingBottom}
                paddingLeft={element.paddingLeft}
                onUpdate={(id, content) => {
                  let targetColumnId = null;
                  Object.keys(elements).forEach((colId) => {
                    if (
                      elements[colId] &&
                      elements[colId].find((el) => el.id === id)
                    ) {
                      targetColumnId = colId;
                    }
                  });
                  if (targetColumnId && onElementUpdate) {
                    onElementUpdate(rowId, targetColumnId, id, content);
                  }
                }}
                onDelete={() =>
                  onElementDelete && onElementDelete(element.id)
                }
                onSelect={(el) =>
                  onElementSelect &&
                  onElementSelect(
                    {
                      ...el,
                      rowId,
                      columnId,
                      alignment: el.alignment || "left",
                    },
                    "column"
                  )
                }
                isSelected={selectedElement?.id === element.id}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center h-full min-h-40 text-center">
          <div className="text-base-content/50">
            <div className="text-4xl mb-2">📝</div>
            <p className="text-sm font-medium">Drop elements here</p>
          </div>
        </div>
      )}
    </div>
  );
};

const LayoutRow = ({
  columns = 2,
  rowId,
  rowIndex,
  onColumnDrop,
  onElementDelete,
  onElementUpdate,
  onColumnDelete,
  onElementSelect,
  elements = {},
  columnProperties = {},
}) => {
  const getColumnClass = () => {
    switch (columns) {
      case 1:
        return "flex flex-col gap-4";
      case 2:
        return "flex gap-4";
      case 3:
        return "flex gap-3";
      case 4:
        return "flex gap-2";
      default:
        return "flex gap-4";
    }
  };

  const handleColumnDrop = (columnId, event) => {
    onColumnDrop(rowId, columnId, event);
  };

  const handleElementDelete = (elementId) => {
    onElementDelete(rowId, elementId);
  };

  const handleElementUpdate = (elementId, content) => {
    let targetColumnId = null;
    Object.keys(elements).forEach((columnId) => {
      if (
        elements[columnId] &&
        elements[columnId].find((el) => el.id === elementId)
      ) {
        targetColumnId = columnId;
      }
    });
    if (targetColumnId) {
      onElementUpdate(rowId, targetColumnId, elementId, content);
    }
  };

  const handleColumnDelete = (columnId) => {
    onColumnDelete(rowId, columnId);
  };

  return (
    <div className="mb-6">
      <div className={`${getColumnClass()}`}>
        {Array.from({ length: columns }, (_, index) => {
          const columnId = `${rowId}-col-${index + 1}`;
          return (
            <ColumnDropZone
              key={columnId}
              columnId={columnId}
              rowId={rowId}
              columnNumber={index + 1}
              onDrop={handleColumnDrop}
              onElementDelete={handleElementDelete}
              onElementUpdate={handleElementUpdate}
              onColumnDelete={handleColumnDelete}
              onElementSelect={onElementSelect}
              elements={elements}
              columnProperties={columnProperties[columnId]}
            />
          );
        })}
      </div>
    </div>
  );
};

export default LayoutRow;
