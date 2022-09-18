import type { AgentData } from '@/pages/interface.d';
import { message, Modal, Table, Tag } from 'antd';
import { AgentStatus } from './interface.d';
import { LoadingOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/lib/table';
import { useLazyQuery } from '@apollo/client';
import { AgentListReply, api } from '@/api/Api4Config';
import { history } from 'umi';
import { useEffect, useState } from 'react';

interface AgentListModalProps {
  title: string;
  visible: boolean;
  selectedAgent?: AgentData[];
  onCancel?: () => void;
  onSelect?: (record: AgentData, selected: boolean) => void;
  onChange?: (selectedRows: AgentData[]) => void;
}

const AgentListModal: React.FC<AgentListModalProps> = (
  props: AgentListModalProps,
) => {
  const [agentList, setAgentList] = useState<AgentData[]>([]);

  const [, { loading, refetch }] = useLazyQuery<
    { AgentList: AgentListReply[] },
    {}
  >(api.getAgentList);

  useEffect(() => {
    if (props.visible) {
      refetch()
        .then((res) => {
          if (res.errors) {
            message.error(res.errors[0].message);
            if (res.errors[0].message === 'auth failed') {
              history.push('/login');
            }
          }
          if (res.data && res.data.AgentList) {
            let data = res.data.AgentList;
            let agentData: AgentData[] = [];
            data.forEach((item: AgentListReply) => {
              agentData.push({
                id: item.id,
                label: item.label,
                host: item.host,
                port: item.port,
                volume: item.volume,
                status: item.status,
              });
            });
            setAgentList(agentData);
          }
        })
        .catch((err) => {
          message.error(err.message);
        });
    }
  }, [props.visible]);

  const statusTag = (status: number) => {
    switch (status) {
      case AgentStatus.IDLE:
        return <Tag color="success">Idel</Tag>;
      case AgentStatus.BUSY:
        return (
          <Tag color="volcano" icon={<LoadingOutlined />}>
            Busy
          </Tag>
        );
      default:
        return <Tag color="default">Unknown</Tag>;
    }
  };

  const columns: ColumnsType<AgentData> = [
    {
      key: 'label',
      title: 'Agent Label',
      dataIndex: 'label',
    },
    {
      key: 'host',
      title: 'Host',
      dataIndex: 'host',
    },
    {
      key: 'port',
      title: 'Port',
      dataIndex: 'port',
    },
    {
      key: 'volume',
      title: 'Volume',
      dataIndex: 'volume',
    },
    {
      key: 'status',
      title: 'status',
      dataIndex: 'status',
      render: (value: any, record: AgentData, _index: number) =>
        statusTag(record.status),
    },
  ];

  const rowIds = props?.selectedAgent?.map((item) => item.id);

  return (
    <Modal
      title={props.title}
      visible={props.visible}
      onCancel={props.onCancel}
      width={800}
      footer={null}
    >
      <Table
        loading={loading}
        columns={columns}
        dataSource={agentList}
        rowKey={(row) => row.id}
        rowSelection={{
          onSelect: (record, selected) => {
            if (props.onSelect) {
              props.onSelect(record, selected);
            }
          },
          selectedRowKeys: rowIds,
          onChange(_selectedRowKeys, selectedRows, _info) {
            if (props.onChange) {
              props.onChange(selectedRows);
            }
          },
          getCheckboxProps: (record) => ({
            disabled: record.status !== AgentStatus.IDLE,
          }),
        }}
      />
    </Modal>
  );
};

export default AgentListModal;
