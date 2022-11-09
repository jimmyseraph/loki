import { api, ScriptDebugReply, ScriptDebugVariables } from '@/api/Api4Config';
import { OnSubscriptionDataOptions, useSubscription } from '@apollo/client';
import { message, Modal, Space, Tag } from 'antd';
import { ReactText, useState } from 'react';
import { history } from 'umi';
import { ProList } from '@ant-design/pro-components';

interface LogType {
  level: string;
  time: string;
  component: string;
  msg: string;
}

interface DebugModalProps {
  title: string;
  scriptId?: string;
  script: string;
  tempCsvFiles?: string[];
  onClose?: () => void;
}
const DebugModal: React.FC<DebugModalProps> = (props: DebugModalProps) => {
  const [expandedRowKeys, setExpandedRowKeys] = useState<readonly ReactText[]>(
    [],
  );

  const [log, setLog] = useState<LogType[]>([]);

  const { error } = useSubscription<
    { ScriptDebug: ScriptDebugReply },
    ScriptDebugVariables
  >(api.subscriptionDebug, {
    variables: {
      id: props.scriptId,
      script: props.script,
      csvTempFilenames: props.tempCsvFiles,
    },
    onSubscriptionData: (
      options: OnSubscriptionDataOptions<{ ScriptDebug: ScriptDebugReply }>,
    ) => {
      if (
        options.subscriptionData.data &&
        options.subscriptionData.data.ScriptDebug
      ) {
        let newLog = JSON.parse(
          options.subscriptionData.data.ScriptDebug.message,
        );
        setLog((prev) => [...prev, newLog]);
      }
    },
  });

  if (error) {
    message.error(error.message);
    if (error.message === 'auth failed') {
      history.push('/login');
    }
  }

  const logLevel = (level: string) => {
    switch (level) {
      case 'debug':
        return <Tag color="default">DEBUG</Tag>;
      case 'info':
        return <Tag color="success">INFO</Tag>;
      case 'warn':
        return <Tag color="warning">WARN</Tag>;
      case 'error':
        return <Tag color="error">ERROR</Tag>;
    }
    return <Tag color="default">level</Tag>;
  };

  return (
    <Modal
      visible={true}
      title={props.title}
      onCancel={props?.onClose}
      width={800}
      footer={null}
      destroyOnClose
    >
      <ProList<LogType>
        rowKey="title"
        // headerTitle="基础列表"
        expandable={{
          expandedRowKeys,
          onExpandedRowsChange: setExpandedRowKeys,
        }}
        dataSource={log}
        metas={{
          title: {
            render: (_text, record: LogType) => {
              return logLevel(record.level);
            },
          },
          subTitle: {
            render: (_text, record: LogType) => {
              return (
                <Space size={0}>
                  <Tag color="blue">{record.component}</Tag>
                  <Tag color="#5BD8A6">{record.time}</Tag>
                </Space>
              );
            },
          },
          description: {
            render: (_text, record: LogType) => {
              return record.msg;
            },
          },
        }}
      />
    </Modal>
  );
};

export default DebugModal;
