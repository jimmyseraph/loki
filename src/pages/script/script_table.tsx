import {
  api,
  ScriptListReply,
  ScriptListVariables,
  ScriptRemoveReply,
  ScriptRemoveVariables,
} from '@/api/Api4Config';
import { useMutation, useQuery } from '@apollo/client';
import { Button, message, Space, Table } from 'antd';
import type { ColumnsType } from 'antd/lib/table';
import moment from 'moment';
import { Link, history } from 'umi';

export interface ScriptData {
  id: string;
  name: string;
  creator: string;
  createTime: string;
  updateTime: string;
}

interface ScriptTableProps {
  scriptListVariables: ScriptListVariables | undefined;
}
const ScriptTable: React.FC<ScriptTableProps> = (props: ScriptTableProps) => {
  const { loading, error, data } = useQuery<
    { ScriptList: ScriptListReply[] },
    ScriptListVariables
  >(api.getScriptList, { variables: props.scriptListVariables });

  const [removeScript] = useMutation<
    { ScriptRemove: ScriptRemoveReply },
    ScriptRemoveVariables
  >(api.removeScript);

  if (error) {
    message.error(error.message);
    // if (error.message === 'auth failed') {
    //   history.push('/login');
    // }
  }

  const columns: ColumnsType<ScriptData> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (value: any, record: ScriptData, index: number) => (
        <Link to={`/script/edit?id=${record.id}`}>{value}</Link>
      ),
    },
    {
      title: 'Creator',
      dataIndex: 'creator',
      key: 'creator',
    },
    {
      title: 'Create Time',
      dataIndex: 'createTime',
      key: 'createTime',
      sorter: (a, b) =>
        moment(a.createTime).valueOf() - moment(b.createTime).valueOf(),
    },
    {
      title: 'Update Time',
      dataIndex: 'updateTime',
      key: 'updateTime',
      sorter: (a, b) =>
        moment(a.updateTime).valueOf() - moment(b.updateTime).valueOf(),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_value: any, record: ScriptData, index: number) => (
        <Space size="middle">
          <Button type="link" onClick={() => handleDelete(record.id)}>
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  const handleDelete = (id: string) => {
    removeScript({ variables: { id } })
      .then((res) => {
        if (res.errors && res.errors.length > 0) {
          message.error(res.errors[0].message);
          // if (res.errors[0].message === 'auth failed') {
          //   history.push('/login');
          // }
          return;
        }
        if (res.data?.ScriptRemove.success) {
          message.success('删除成功');
          // getData(searchParam);
        } else {
          message.error('删除失败');
        }
      })
      .catch((err) => {
        message.error(err.message);
      });
  };

  return (
    <Table
      columns={columns}
      dataSource={data?.ScriptList}
      rowKey={(row) => row.id}
      style={{ marginTop: '10px' }}
      loading={loading}
    />
  );
};

export default ScriptTable;
