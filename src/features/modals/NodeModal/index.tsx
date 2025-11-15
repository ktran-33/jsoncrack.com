import React, {useState} from "react";
import type { ModalProps } from "@mantine/core";
import { Modal, Stack, Text, ScrollArea, Flex, CloseButton, Button, Textarea, TextInput } from "@mantine/core";
import { CodeHighlight } from "@mantine/code-highlight";
import type { NodeData } from "../../../types/graph";
import useGraph from "../../editor/views/GraphView/stores/useGraph";

// return object from json removing array and object fields
const normalizeNodeData = (nodeRows: NodeData["text"]) => {
  if (!nodeRows || nodeRows.length === 0) return "{}";
  if (nodeRows.length === 1 && !nodeRows[0].key) return `${nodeRows[0].value}`;

  const obj = {};
  nodeRows?.forEach(row => {
    if (row.type !== "array" && row.type !== "object") {
      if (row.key) obj[row.key] = row.value;
    }
  });
  return JSON.stringify(obj, null, 2);
};

// return json path in the format $["customer"]
const jsonPathToString = (path?: NodeData["path"]) => {
  if (!path || path.length === 0) return "$";
  const segments = path.map(seg => (typeof seg === "number" ? seg : `"${seg}"`));
  return `$[${segments.join("][")}]`;
};

export const NodeModal = ({ opened, onClose }: ModalProps) => {
  const nodeData = useGraph(state => state.selectedNode);
  //Start of Copilot AI Generated Code
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState<Record<string, string>>({});

  const handleEditClick = () => {
    // Create object with key-value pairs for editing
    const values: Record<string, string> = {};
    nodeData?.text?.forEach(row => {
      if (row.type !== "array" && row.type !== "object" && row.key) {
        //Used Copilot Quick Fix feature to debug line below
        values[row.key] = String(row.value ?? "");
      }
    });
    setEditValue(values);
    setIsEditing(true);
  };

  const handleSave = () => {
    // Parse values back to their original types
    const parsedValues: Record<string, any> = {};
    
    Object.entries(editValue).forEach(([key, value]) => {
      // Try to parse as JSON first (handles numbers, booleans, null, etc.)
      try {
        parsedValues[key] = JSON.parse(value);
      } catch {
        // If JSON parsing fails, keep as string
        parsedValues[key] = value;
      }
    });

    const updatedJson = JSON.stringify(parsedValues, null, 2);
    console.log("Saving:", updatedJson);
    useGraph.getState().updateNodeData(updatedJson);
    setIsEditing(false);
  };

  const handleValueChange = (key: string, newValue: string) => {
    setEditValue(prev => ({
      ...prev,
      [key]: newValue
    }));
  };

  return (
    <Modal size="auto" opened={opened} onClose={onClose} centered withCloseButton={false}>
      <Stack pb="sm" gap="sm">
        <Stack gap="xs">
          <Flex justify="space-between" align="center">
            <Text fz="xs" fw={500}>
              Content
            </Text>
            <CloseButton onClick={onClose} />
          </Flex>

          {/*Co-pilot Generated Code Below*/}

          {isEditing ? (
            <Stack gap="xs">
              {Object.entries(editValue).map(([key, value]) => (
                <div key={key}>
                  <Text fz="xs" fw={500} mb={4}>
                    {key}
                  </Text>
                  <TextInput
                    value={value}
                    onChange={(e) => handleValueChange(key, e.currentTarget.value)}
                    placeholder={`Edit ${key}`}
                    style={{ fontFamily: "monospace" }}
                  />
                </div>
              ))}
              <Flex gap="xs">
                <Button color="green" onClick={handleSave}>
                  Save
                </Button>
                <Button color="red" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </Flex>
            </Stack>
          ) : (
            <>
              <ScrollArea.Autosize mah={250} maw={600}>
                <CodeHighlight
                  code={normalizeNodeData(nodeData?.text ?? [])}
                  miw={350}
                  maw={600}
                  language="json"
                  withCopyButton
                />
              </ScrollArea.Autosize>
              <Button color="green" onClick={handleEditClick}>
                Edit
              </Button>
            </>
          )}
        </Stack>
        <Text fz="xs" fw={500}>
          JSON Path
        </Text>
        <ScrollArea.Autosize maw={600}>
          <CodeHighlight
            code={jsonPathToString(nodeData?.path)}
            miw={350}
            mah={250}
            language="json"
            copyLabel="Copy to clipboard"
            copiedLabel="Copied to clipboard"
            withCopyButton
          />
        </ScrollArea.Autosize>
      </Stack>
    </Modal>
  );
};
