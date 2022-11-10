import {
  Button,
  Col,
  Divider,
  Form,
  Input,
  message,
  Row,
  Switch,
  Upload,
  UploadFile,
  UploadProps,
} from 'antd';
import { ApolloClient, InMemoryCache } from '@apollo/client';
import { createUploadLink } from 'apollo-upload-client';
import React, { useState } from 'react';
import { ScriptFormProps } from '../create';
import { getParamElements, removeParamElement, setParamArray } from './common';
import { UploadOutlined } from '@ant-design/icons';
import {
  api,
  CsvUploadVariables,
  CsvUploadReply,
  CsvRemoveVariables,
  CsvRemoveReply,
} from '@/api/Api4Config';
import { history } from 'umi';
import customFetch from './customFetch';

interface PlanProps extends ScriptFormProps {
  fileList?: string[];
}

function initUploadCsvFiles(
  xmlNode: Element | null,
  fileList?: string[],
): Map<string, string> {
  let uploadFilesMap: Map<string, string> = new Map();
  if (getParamElements(xmlNode!, 'csv') !== null) {
    getParamElements(xmlNode!, 'csv').forEach((item: Element) => {
      let facade = item.textContent;
      uploadFilesMap.set(facade!, facade!);
    });
  }
  if (fileList !== undefined && fileList.length > 0) {
    fileList.forEach((item: string) => {
      uploadFilesMap.set(item.substring(0, item.indexOf('-temp')), item);
    });
  }
  return uploadFilesMap;
}

const PlanForm: React.FC<PlanProps> = (props: PlanProps) => {
  const [form] = Form.useForm();

  const [enabled, setEnabled] = useState<boolean>(
    props.xmlNode?.getAttribute('enabled') === 'true',
  );

  const [uploadFiles, setUploadFiles] = useState<Map<string, string>>(
    initUploadCsvFiles(props.xmlNode, props.fileList),
  );

  const { xmlNode, onChange } = props;

  const client = new ApolloClient({
    cache: new InMemoryCache(),
    link: createUploadLink({
      uri: '/apiv4',
      headers: {
        'Access-Token': `${localStorage.getItem('token')}`,
      },
    }),
  });

  const handleEnabled = (
    checked: boolean,
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    setEnabled(checked);
  };

  const handleApply = () => {
    form.submit();
  };

  const handleFinish = (files: Map<string, string>) => {
    let label = form.getFieldValue('label');
    let enabled = form.getFieldValue('enabled');
    xmlNode?.setAttribute('label', label);
    xmlNode?.setAttribute('enabled', enabled.toString());
    setParamArray(
      xmlNode!,
      'csv',
      Array.from<[string, string], string>(uploadFiles, ([key]) => key),
      'file',
    );
    if (onChange) {
      let changeFiles: string[] = [];
      console.log('uploadFiles', uploadFiles);
      uploadFiles.forEach((value, key) => {
        if (key !== value) {
          console.log('key: ' + key + ', value: ' + value);
          changeFiles.push(value);
        }
      });
      onChange(xmlNode as Element, changeFiles);
    }
  };

  const uploadProps: UploadProps = {
    multiple: false,
    defaultFileList: Array.from<[string, string], UploadFile>(
      uploadFiles,
      ([key, value]) => {
        return {
          uid: key,
          name: key + '.csv',
          status: 'done',
        };
      },
    ),
    beforeUpload: (file) => {
      const isCSV = file.type === 'text/csv';
      if (!isCSV) {
        message.error(`${file.name} is not a csv file`);
      }
      return isCSV || Upload.LIST_IGNORE;
    },
    onChange: ({ file, fileList }) => {
      if (file.status === 'error') {
        fileList = fileList.filter((item) => item.uid !== file.uid);
      }
    },
    onRemove: (file) => {
      if (file.status === 'error') {
        return true;
      } else if (file.status === 'done') {
        // console.log("remove", file, uploadFiles);
        let name = file.name.endsWith('.csv')
          ? file.name.substring(0, file.name.length - 4)
          : file.name;
        let payload: CsvRemoveVariables;
        if (uploadFiles.get(name) === name) {
          payload = {
            id: props.scriptId,
            filename: name,
          };
        } else {
          payload = {
            filename: uploadFiles.get(name) as string,
          };
        }

        client
          .mutate<
            { CsvRemove: CsvRemoveReply },
            { csvRemoveRequest: CsvRemoveVariables }
          >({
            mutation: api.removeCsvFile,
            variables: {
              csvRemoveRequest: payload,
            },
          })
          .then((res) => {
            removeParamElement(xmlNode!, 'csv', name);
            if (res.errors && res.errors.length > 0) {
              console.log(res.errors);
              message.error(res.errors[0].message);
              // if (res.errors[0].message === 'auth failed') {
              //   history.push('/login');
              // }
            }
            message.success(`${name} file remove successfully`);
            uploadFiles.delete(name);

            setUploadFiles(uploadFiles);
            return true;
          })
          .catch((err) => {
            removeParamElement(xmlNode!, 'csv', name);
            message.error(err.message);
            // console.log(err);
            // if (err.message === 'auth failed') {
            //   history.push('/login');
            // }
            return false;
          });
      }
    },
    customRequest: ({ file, onSuccess, onError, onProgress }) => {
      let f = file as File;

      let name = f.name?.endsWith('.csv')
        ? f.name.substring(0, f.name.length - 4)
        : f.name;
      client.setLink(
        createUploadLink({
          uri: '/apiv4',
          headers: {
            'Access-Token': `${localStorage.getItem('token')}`,
          },
          fetch: typeof window === 'undefined' ? global.fetch : customFetch,
          fetchOptions: {
            onProgress: (progress: ProgressEvent) => {
              // console.log(progress);
              onProgress
                ? onProgress({
                    percent: Math.round(
                      (progress.loaded / progress.total) * 100,
                    ),
                  })
                : null;
            },
          },
        }),
      );
      client
        .mutate<
          { CsvUpload: CsvUploadReply },
          { csvUploadRequest: CsvUploadVariables }
        >({
          mutation: api.uploadCsvFile,
          variables: {
            csvUploadRequest: {
              name: name as string,
              file: f,
            },
          },
        })
        .then((res) => {
          if (res.errors && res.errors.length > 0) {
            console.log(res.errors);
            message.error(res.errors[0].message);
            // if (res.errors[0].message === 'auth failed') {
            //   history.push('/login');
            // }
          }
          message.success(`${f.name} file uploaded successfully`);
          console.log(res.data?.CsvUpload);
          setUploadFiles(
            uploadFiles.set(name, res.data?.CsvUpload.temp as string),
          );
          onSuccess ? onSuccess(res.data?.CsvUpload.temp as string) : null;
        })
        .catch((err) => {
          message.error(err.message);
          // console.log(err);
          // if (err.message === 'auth failed') {
          //   history.push('/login');
          // }
          onError ? onError(err) : null;
        });

      return {
        abort: () => {
          message.info('abort upload');
        },
      };
    },
  };

  return (
    <Form
      form={form}
      name="test_plan_form"
      autoComplete="off"
      layout="horizontal"
      onFinish={() => handleFinish(uploadFiles)}
    >
      <Row>
        <Col>
          <h3>Test Plan</h3>
        </Col>
      </Row>

      <Row gutter={24} style={{ marginTop: '1.5em' }}>
        <Col span={10}>
          <Form.Item
            name="enabled"
            valuePropName="checked"
            initialValue={enabled}
          >
            <Switch
              checkedChildren="Enabled"
              unCheckedChildren="Disabled"
              onChange={handleEnabled}
            />
          </Form.Item>
          <Form.Item
            name="label"
            label="Label"
            initialValue={xmlNode?.getAttribute('label')}
            rules={[
              { required: true, message: 'Missing Label' },
              { max: 20, message: 'Length larger then 20' },
            ]}
          >
            <Input placeholder="test plan" disabled={!enabled} />
          </Form.Item>
        </Col>
      </Row>
      <Divider orientation="left" plain>
        CSV Files configure
      </Divider>
      <Row gutter={8}>
        <Col span={14}>
          <Upload {...uploadProps}>
            <Button icon={<UploadOutlined />}>Upload</Button>
          </Upload>
        </Col>
      </Row>
      <Row gutter={24} style={{ marginTop: '1.5em' }}>
        <Col>
          <Button type="primary" onClick={handleApply}>
            Apply
          </Button>
        </Col>
      </Row>
    </Form>
  );
};

export default PlanForm;
