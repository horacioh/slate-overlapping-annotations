import { useMemo, useCallback, useEffect, useRef } from "react";
import { createEditor, Descendant, Editor, Range } from "slate";
import { Slate, Editable, withReact, ReactEditor } from "slate-react";
import "./App.scss";
import 'show-keys'

const initialValue: Descendant[] = [
  {
    type: "paragraph",
    children: [
      {
        text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. ",
        comments: [],
      },
      {
        text: "Ut enim ad minim veniam",
        comments: ["conversationId-1"],
      },
      {
        text: ", quis nostrud exercitation ullamco laboris",
        comments: ["conversationId-1", "conversationId-2"],
      },
      {
        text: " nisi ut aliquip ex ea commodo consequat.",
        comments: ["conversationId-2"],
      },
      {
        text: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
        comments: [],
      },
    ],
  },
];

export default function App() {
  const renderElement = useCallback((props) => <Element {...props} />, []);
  const renderLeaf = useCallback((props) => <Leaf {...props} />, []);
  const editor = useMemo(() => withComments(withReact(createEditor())), []);

  return (
    <div className="app">
      <Slate editor={editor} value={initialValue}>
        <BlurEditor editor={editor} />
        <Editable
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          spellCheck
          autoFocus
        />
      </Slate>
    </div>
  );
}

const Element = ({ attributes, children, element }) => {
  switch (element.type) {
    case "heading":
      return <h1 {...attributes}>{children}</h1>;
    default:
      return <p {...attributes}>{children}</p>;
  }
};

const Leaf = ({ attributes, children, leaf }) => {
  let className =
    leaf.comments && leaf.comments.length
      ? `${leaf.comments.map((c) => c).join(" ")} comments-level-${
          leaf.comments.length
        }`
      : undefined;
  return (
    <span {...attributes} className={className}>
      {children}
    </span>
  );
};

function withComments(editor: Editor) {
  let { apply } = editor;

  editor.apply = (op) => {
    /**
     * In order to receive just one particular type of event in the editor (set_selection), we need to override the `apply` hook in the editor
     */
    if (op.type == "set_selection") {
      // check if the new Selection is a Range or not. If it is, that generally says that the selection has no offset, which means is collapsed. It jumps from one Point to another.
      if (Range.isRange(op.newProperties)) {
        // we are just being 100% sure the selection is not collapsed before we really apply the operation into the editor.
        if (!Range.isCollapsed(op.newProperties)) {
          apply(op);
        } else {
          // here we are blurring the editor since we don't want to show the cursor (caret) in this mode. this is just a "selection mode".
          ReactEditor.blur(editor);
        }
      } else {
        // apply the operation for any `newProperties` that are not ranges (usually this is changing the offset of the selection)
        apply(op);
      }
    } else {
      ReactEditor.blur(editor);
    }
  };

  return editor;
}

function BlurEditor({ editor }: { editor: Editor }) {
  useEffect(() => {
    console.log(editor.selection);
  }, [editor.selection]);
  return null;
}
