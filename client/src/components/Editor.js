import React, { useEffect, useRef } from "react";
import "codemirror/mode/javascript/javascript"
import "codemirror/mode/python/python"; // Import Python mode for CodeMirror
import "codemirror/theme/yonce.css"; // Import Yonce theme for CodeMirror
import "codemirror/addon/edit/closetag"; // Import addon for closing tags automatically
import "codemirror/addon/edit/closebrackets"; // Import addon for closing brackets automatically
import "codemirror/lib/codemirror.css"; // Import CodeMirror CSS
import CodeMirror from "codemirror"; // Import CodeMirror library
import { ACTIONS } from "../Actions"; // Import actions

function Editor({ socketRef, roomId, onCodeChange }) {
  const editorRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      const editor = CodeMirror.fromTextArea(
        document.getElementById("realtimeEditor"),
        {
          mode: { name: "python", json: true }, // Set mode to Python with JSON support
          theme: "yonce", // Set theme to Yonce
          autoCloseTags: true, // Enable automatic closing of HTML tags
          autoCloseBrackets: true, // Enable automatic closing of brackets
          lineNumbers: true, // Show line numbers
        }
      );
      editorRef.current = editor; // Save editor instance to ref

      editor.setSize(null, "200%"); // Set editor size

      // Event listener for code changes
      editorRef.current.on("change", (instance, changes) => {
        const { origin } = changes;
        const code = instance.getValue(); // Get current code content
        onCodeChange(code); // Call onCodeChange function with updated code
        if (origin !== "setValue") { // Check if change originated from user input
          socketRef.current.emit(ACTIONS.CODE_CHANGE, {
            roomId,
            code,
          }); // Emit socket event for code change
        }
      });
    };

    init();
  }, []); 

  // Effect for handling incoming code changes from socket
  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.on(ACTIONS.CODE_CHANGE, ({ code }) => {
        if (code !== null) {
          editorRef.current.setValue(code); // Update editor content with received code
        }
      });
    }
    return () => {
      socketRef.current.off(ACTIONS.CODE_CHANGE); // Clean up event listener
    };
  }, [socketRef.current]); // Run effect when socketRef changes

  return (
    <div style={{ height: "600px" }}>
      <textarea id="realtimeEditor"></textarea> {/* CodeMirror textarea */}
    </div>
  );
}

export default Editor;
