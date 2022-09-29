import { useState } from 'react';
import MDEditor from '@uiw/react-md-editor';

const Dashboard: React.FC = (props: any) => {
  const [content, setContent] = useState<string>('');

  fetch('./dashboard.md')
    .then((res) => res.text())
    .then((text) => {
      setContent(text);
    });

  return (
    <div>
      <MDEditor.Markdown
        style={{ padding: 15 }}
        source={content}
        linkTarget="_blank"
        warpperElement={{
          'data-color-mode': 'light',
        }}
      />
    </div>
  );
};

export default Dashboard;
