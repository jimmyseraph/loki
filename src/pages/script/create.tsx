import { Tree, Menu, Dropdown, Row, Col, Button, Space, message } from 'antd';
import type { DataNode, EventDataNode, TreeProps } from 'antd/lib/tree';
import type { ItemType } from 'antd/lib/menu/hooks/useItems';
import type { MenuInfo } from 'rc-menu/lib/interface';
import React, { ReactNode, useEffect, useState } from 'react';
import PlanForm from './form/plan';
import ThreadGroupForm, { initThreadGroupElement } from './form/threadGroup';
// import Request from '@/utils/Request';
import {
  api,
  ScriptDetailReply,
  ScriptDetailVariables,
  ScriptSaveReply,
  ScriptSaveVariables,
} from '@/api/Api4Config';
import './create.less';
import HelloSamplerForm, { initHelloSamplerElement } from './form/helloSampler';
import HTTPSamplerForm, { initHTTPSamplerElement } from './form/httpSampler';
import LoopControllerForm, {
  initLoopControllerElement,
} from './form/loopController';
import IfControllerForm, { initIfControllerElement } from './form/ifController';
import VariableConfigForm, {
  initVariableConfigElement,
} from './form/variableConfig';
import { SCRIPT_NODE_RULE } from './form/common';
import { history } from 'umi';
import RegExpExtractorForm, {
  initRegExpExtractorElement,
} from './form/regexpExtractor';
import JSONPathExtractorForm, {
  initJSONPathExtractorElement,
} from './form/jsonpathExtractor';
import ResponseAssertionForm, {
  initResponseAssertionElement,
} from './form/responseAssertion';
import { useLazyQuery, useMutation } from '@apollo/client';
import DebugModal from './debug_modal';

export interface ScriptFormProps {
  key?: React.Key;
  doc: XMLDocument;
  xmlNode: Element | null;
  onChange?: (xml: Element) => void;
}
export interface ScriptTreeDataNode extends DataNode {
  type: string;
  category: string;
  enabled: boolean;
  children?: ScriptTreeDataNode[];
}

const emptyScript = `<?xml version="1.0" encoding="UTF-8"?><TestPlan label="Test Plan" enabled="true" id="root"></TestPlan>`;
const initScriptXML = (): XMLDocument => {
  let parser = new DOMParser();
  return parser.parseFromString(emptyScript, 'application/xml');
};

const initTreeData = (): ScriptTreeDataNode[] => {
  return [
    {
      key: 'root',
      title: 'Test Plan',
      type: 'TestPlan',
      category: 'TestPlan',
      enabled: true,
    },
  ];
};

const initCurrentForm = () => {
  let doc = initScriptXML();
  let element = doc.querySelector('TestPlan');
  return <PlanForm doc={doc} xmlNode={element} />;
};

const CreateOrUpdateScript: React.FC = (props: any) => {
  // console.log(props)

  const [expendKeys, setExpendKeys] = useState<React.Key[]>([]);
  const [selectKeys, setSelectKeys] = useState<React.Key[]>([]);
  const [treeData, setTreeData] = useState<ScriptTreeDataNode[]>(
    initTreeData(),
  );
  const [scriptXML, setScriptXML] = useState<XMLDocument>(initScriptXML());
  const [currentForm, setCurrentForm] = useState<ReactNode>(initCurrentForm());
  const [loadData, setLoadData] = useState<number>(0);

  const [debug, setDebug] = useState<boolean>(false);

  const [getScriptDetail] = useLazyQuery<
    { ScriptDetail: ScriptDetailReply },
    ScriptDetailVariables
  >(api.getScriptDetail);
  const [saveScript] = useMutation<
    ScriptSaveReply,
    { scriptSaveRequest: ScriptSaveVariables }
  >(api.saveScript);

  useEffect(() => {
    const { pathname, query } = props.location;
    if (pathname === '/script/edit') {
      getScriptDetail({ variables: { id: props?.location?.query?.id } })
        .then((res) => {
          // console.log(res)
          if (res.error) {
            message.error(res.error.message);
            if (res.error.message === 'auth failed') {
              history.push('/login');
            }
            return;
          }
          let xmlStr: string = res.data?.ScriptDetail.script as string;
          // console.log(xmlStr);
          let xmlDoc = new DOMParser().parseFromString(
            xmlStr,
            'application/xml',
          );
          setScriptXML(xmlDoc);
          let datas = parseTreeDataFromXML(xmlDoc.firstChild as Element);
          setTreeData(datas);
        })
        .catch((err) => {
          message.error(err.message);
          if (err.message === 'auth failed') {
            history.push('/login');
          }
        });
    }
  }, [loadData]);

  const handleSave = () => {
    const { query } = props.location;
    let script_name = scriptXML
      .getElementsByTagName('TestPlan')[0]
      .getAttribute('label');
    saveScript({
      variables: {
        scriptSaveRequest: {
          id: query?.id,
          name: script_name as string,
          script: new XMLSerializer().serializeToString(scriptXML),
        },
      },
    })
      .then((res) => {
        if (res.errors && res.errors.length > 0) {
          message.error(res.errors[0].message);
          if (res.errors[0].message === 'auth failed') {
            history.push('/login');
          }
          return;
        }
        message.success('Save script successed');
      })
      .catch((err) => {
        message.error(err.message);
        if (err.message === 'auth failed') {
          history.push('/login');
        }
      });
  };

  const handleCancel = () => {
    history.goBack();
  };

  const handleMenuClick = (
    obj: MenuInfo,
    item: ScriptTreeDataNode,
    label: string,
  ) => {
    let now = new Date().getTime();
    let children = [
      {
        key: `${obj.key}-${now}`,
        title: label,
        type: obj.key,
        category: obj.keyPath[obj.keyPath.length - 1],
        enabled: true,
      },
    ];
    if (obj.keyPath[obj.keyPath.length - 1] === 'Threads') {
      // Add thread
      console.log('add ' + obj.key);
      setTreeData((origin) => updateTreeData(origin, item.key, children));
      let xmlNode: Element;
      if (obj.key === 'ThreadGroup') {
        // add ThreadGroup
        xmlNode = initThreadGroupElement(children[0].key, children[0].title);
      }
      setScriptXML((origin) => {
        let data = origin;
        data.getElementById(item.key as string)?.appendChild(xmlNode);
        return data;
      });
      setExpendKeys((origin) => {
        let key = origin.find((k) => {
          // console.log(k);
          return k === item.key;
        });

        if (key === undefined) {
          origin.push(item.key);
        }

        return origin;
      });
    } else if (obj.keyPath[obj.keyPath.length - 1] === 'Controllers') {
      // add controller
      console.log('add ' + obj.key);
      setTreeData((origin) => updateTreeData(origin, item.key, children));
      let xmlNode: Element;
      if (obj.key === 'LoopController') {
        // add LoopController
        xmlNode = initLoopControllerElement(children[0].key, children[0].title);
      }
      if (obj.key === 'IfController') {
        // add IfController
        xmlNode = initIfControllerElement(children[0].key, children[0].title);
      }
      setScriptXML((origin) => {
        let data = origin;
        data.getElementById(item.key as string)?.appendChild(xmlNode);
        return data;
      });
      setExpendKeys((origin) => {
        let key = origin.find((k) => {
          // console.log(k);
          return k === item.key;
        });

        if (key === undefined) {
          origin.push(item.key);
        }

        return origin;
      });
    } else if (obj.keyPath[obj.keyPath.length - 1] === 'Samplers') {
      // add sampler
      console.log('add ' + obj.key);
      setTreeData((origin) => updateTreeData(origin, item.key, children));
      let xmlNode: Element;
      if (obj.key === 'HelloSampler') {
        // add HelloSampler
        xmlNode = initHelloSamplerElement(children[0].key, children[0].title);
      }
      if (obj.key === 'HTTPSampler') {
        // add HTTPSampler
        xmlNode = initHTTPSamplerElement(children[0].key, children[0].title);
      }
      setScriptXML((origin) => {
        let data = origin;
        data.getElementById(item.key as string)?.appendChild(xmlNode);
        return data;
      });
      setExpendKeys((origin) => {
        let key = origin.find((k) => {
          // console.log(k);
          return k === item.key;
        });

        if (key === undefined) {
          origin.push(item.key);
        }

        return origin;
      });
    } else if (obj.keyPath[obj.keyPath.length - 1] === 'Config') {
      // add config
      console.log('add ' + obj.key);
      setTreeData((origin) => updateTreeData(origin, item.key, children));
      let xmlNode: Element;
      if (obj.key === 'Variable') {
        // add Variable
        xmlNode = initVariableConfigElement(children[0].key, children[0].title);
      }
      setScriptXML((origin) => {
        let data = origin;
        data.getElementById(item.key as string)?.appendChild(xmlNode);
        return data;
      });
      setExpendKeys((origin) => {
        let key = origin.find((k) => {
          // console.log(k);
          return k === item.key;
        });

        if (key === undefined) {
          origin.push(item.key);
        }

        return origin;
      });
    } else if (obj.keyPath[obj.keyPath.length - 1] === 'PostProcessor') {
      // add PostProcessor
      console.log('add ' + obj.key);
      setTreeData((origin) => updateTreeData(origin, item.key, children));
      let xmlNode: Element;
      if (obj.key === 'RegExpExtractor') {
        // add RegExp Extractor
        xmlNode = initRegExpExtractorElement(
          children[0].key,
          children[0].title,
        );
      }
      if (obj.key === 'JSONPathExtractor') {
        // add JSON Path Extractor
        xmlNode = initJSONPathExtractorElement(
          children[0].key,
          children[0].title,
        );
      }
      setScriptXML((origin) => {
        let data = origin;
        data.getElementById(item.key as string)?.appendChild(xmlNode);
        return data;
      });
      setExpendKeys((origin) => {
        let key = origin.find((k) => {
          // console.log(k);
          return k === item.key;
        });

        if (key === undefined) {
          origin.push(item.key);
        }

        return origin;
      });
    } else if (obj.keyPath[obj.keyPath.length - 1] === 'Assertion') {
      // add assertion
      console.log('add ' + obj.key);
      setTreeData((origin) => updateTreeData(origin, item.key, children));
      let xmlNode: Element;
      if (obj.key === 'ResponseAssertion') {
        // add response assertion
        xmlNode = initResponseAssertionElement(
          children[0].key,
          children[0].title,
        );
      }
      setScriptXML((origin) => {
        let data = origin;
        data.getElementById(item.key as string)?.appendChild(xmlNode);
        return data;
      });
      setExpendKeys((origin) => {
        let key = origin.find((k) => {
          // console.log(k);
          return k === item.key;
        });

        if (key === undefined) {
          origin.push(item.key);
        }

        return origin;
      });
    } else if (obj.keyPath[obj.keyPath.length - 1] === 'Enable') {
      console.log('enable/disable ' + item.key);
      setTreeData((origin) => enableTreeNode(origin, item.key));
      setScriptXML((origin) => {
        let data = origin;
        data
          .getElementById(item.key as string)
          ?.setAttribute('enabled', item.enabled ? 'true' : 'false');
        return data;
      });
    } else if (obj.keyPath[obj.keyPath.length - 1] === 'Delete') {
      console.log('delete ' + item.key);
      setTreeData((origin) => {
        let td = deleteTreeNode(origin, item.key);
        if (td.length === 0) {
          td = initTreeData();
        }
        return td;
      });
      setScriptXML((origin) => {
        let data = origin;
        data.getElementById(item.key as string)?.remove();
        if (data.childElementCount === 0) {
          data = initScriptXML();
        }
        return data;
      });
    }
  };

  const handleChange = (xml: Element) => {
    let td = [...treeData];
    let script = scriptXML;

    let parent = script.getElementById(xml.id)?.parentElement;
    // parent?.removeChild(script.getElementById(xml.id) as Element);
    parent?.replaceChild(script.getElementById(xml.id) as Element, xml);
    loopTreeData(td, xml.id, (node, i, d) => {
      node.title = xml.getAttribute('label');
      node.enabled = (xml.getAttribute('enabled') as string) === 'true';
    });
    setScriptXML(script);
    setTreeData(td);
  };

  const handleSelect = (
    keys: React.Key[],
    info: {
      event: 'select';
      selected: boolean;
      node: EventDataNode<ScriptTreeDataNode>;
      selectedNodes: ScriptTreeDataNode[];
      nativeEvent: MouseEvent;
    },
  ) => {
    setSelectKeys(keys);
    if (info.selected) {
      if (info.node.type === 'TestPlan') {
        let element = scriptXML.getElementById(info.node.key as string);
        setCurrentForm(
          <PlanForm
            doc={scriptXML}
            xmlNode={element}
            onChange={handleChange}
            key={info.node.key}
          />,
        );
      } else if (info.node.type === 'ThreadGroup') {
        let element = scriptXML.getElementById(info.node.key as string);
        setCurrentForm(
          <ThreadGroupForm
            doc={scriptXML}
            xmlNode={element}
            onChange={handleChange}
            key={info.node.key}
          />,
        );
      } else if (info.node.type === 'HelloSampler') {
        let element = scriptXML.getElementById(info.node.key as string);
        setCurrentForm(
          <HelloSamplerForm
            doc={scriptXML}
            xmlNode={element}
            onChange={handleChange}
            key={info.node.key}
          />,
        );
      } else if (info.node.type === 'HTTPSampler') {
        let element = scriptXML.getElementById(info.node.key as string);
        setCurrentForm(
          <HTTPSamplerForm
            doc={scriptXML}
            xmlNode={element}
            onChange={handleChange}
            key={info.node.key}
          />,
        );
      } else if (info.node.type === 'LoopController') {
        let element = scriptXML.getElementById(info.node.key as string);
        setCurrentForm(
          <LoopControllerForm
            doc={scriptXML}
            xmlNode={element}
            onChange={handleChange}
            key={info.node.key}
          />,
        );
      } else if (info.node.type === 'IfController') {
        let element = scriptXML.getElementById(info.node.key as string);
        setCurrentForm(
          <IfControllerForm
            doc={scriptXML}
            xmlNode={element}
            onChange={handleChange}
            key={info.node.key}
          />,
        );
      } else if (info.node.type === 'Variable') {
        let element = scriptXML.getElementById(info.node.key as string);
        setCurrentForm(
          <VariableConfigForm
            doc={scriptXML}
            xmlNode={element}
            onChange={handleChange}
            key={info.node.key}
          />,
        );
      } else if (info.node.type === 'RegExpExtractor') {
        let element = scriptXML.getElementById(info.node.key as string);
        setCurrentForm(
          <RegExpExtractorForm
            doc={scriptXML}
            xmlNode={element}
            onChange={handleChange}
            key={info.node.key}
          />,
        );
      } else if (info.node.type === 'JSONPathExtractor') {
        let element = scriptXML.getElementById(info.node.key as string);
        setCurrentForm(
          <JSONPathExtractorForm
            doc={scriptXML}
            xmlNode={element}
            onChange={handleChange}
            key={info.node.key}
          />,
        );
      } else if (info.node.type === 'ResponseAssertion') {
        let element = scriptXML.getElementById(info.node.key as string);
        setCurrentForm(
          <ResponseAssertionForm
            doc={scriptXML}
            xmlNode={element}
            onChange={handleChange}
            key={info.node.key}
          />,
        );
      } else {
        setCurrentForm(<div></div>);
      }
    } else {
      setCurrentForm(<div></div>);
    }
  };

  const loopTreeData = (
    data: ScriptTreeDataNode[],
    key: React.Key,
    callback: (
      node: ScriptTreeDataNode,
      i: number,
      data: ScriptTreeDataNode[],
    ) => void,
  ) => {
    for (let i = 0; i < data.length; i++) {
      if (data[i].key === key) {
        return callback(data[i], i, data);
      }
      if (data[i].children) {
        loopTreeData(data[i].children!, key, callback);
      }
    }
  };

  const handleDrop: TreeProps['onDrop'] = (info) => {
    const dropKey = info.node.key;
    const dragKey = info.dragNode.key;
    const dropPos = info.node.pos.split('-');
    const dropPosition =
      info.dropPosition - Number(dropPos[dropPos.length - 1]);

    const data = [...treeData];
    const xml = scriptXML;

    // console.log(dragKey, dropKey);
    let dragElement = xml.getElementById(dragKey as string) as Element;
    let dropElement = xml.getElementById(dropKey as string) as Element;

    // check rule
    // console.log(dropElement);
    let dragCategory =
      dragElement.tagName === 'TestPlan'
        ? 'TestPlan'
        : (dragElement.getAttribute('category') as string);
    if (dragCategory === 'TestPlan') {
      return;
    }
    let dropCategory =
      dropElement.tagName === 'TestPlan'
        ? 'TestPlan'
        : (dropElement.getAttribute('category') as string);
    if (!info.dropToGap) {
      if (!Object(SCRIPT_NODE_RULE)[dropCategory].includes(dragCategory)) {
        return;
      }
    } else if (
      (info.node.children || []).length > 0 && // Has children
      info.node.expanded && // Is expanded
      dropPosition === 1 // On the bottom gap
    ) {
      if (!Object(SCRIPT_NODE_RULE)[dropCategory].includes(dragCategory)) {
        return;
      }
    } else {
      if (dropPosition !== -1) {
        dropCategory =
          dropElement.parentElement?.tagName === 'TestPlan'
            ? 'TestPlan'
            : (dropElement.parentElement?.getAttribute('category') as string);
        if (!Object(SCRIPT_NODE_RULE)[dropCategory].includes(dragCategory)) {
          return;
        }
      }
    }

    // find dragObject
    let dragObj: ScriptTreeDataNode;
    loopTreeData(data, dragKey, (item, index, arr) => {
      if (dropPosition !== -1) {
        arr.splice(index, 1);
      }
      dragObj = item;
    });
    if (dropPosition !== -1) {
      dragElement.remove();
    }
    // console.log("position:", dropPosition);
    if (!info.dropToGap) {
      // Drop on the content
      loopTreeData(data, dropKey, (item) => {
        item.children = item.children || [];
        // where to insert
        item.children.unshift(dragObj);
      });

      if (dropElement.childElementCount > 0) {
        let child: Element = dropElement.lastChild as Element;
        for (let i = 0; i < dropElement.childElementCount; i++) {
          child = dropElement.children[i];
          if (child.tagName === 'Component') {
            dropElement.insertBefore(dragElement, child);
            break;
          }
        }
        if (child.tagName === 'Param') {
          dropElement.appendChild(dragElement);
        }
      } else {
        dropElement.appendChild(dragElement);
      }
    } else if (
      (info.node.children || []).length > 0 && // Has children
      info.node.expanded && // Is expanded
      dropPosition === 1 // On the bottom gap
    ) {
      loopTreeData(data, dropKey, (item) => {
        item.children = item.children || [];
        // where to insert
        item.children.unshift(dragObj);
      });
      if (dropElement.childElementCount > 0) {
        let child: Element = dropElement.lastChild as Element;
        for (let i = 0; i < dropElement.childElementCount; i++) {
          child = dropElement.children[i];
          if (child.tagName === 'Component') {
            dropElement.insertBefore(dragElement, child);
            break;
          }
        }
        if (child.tagName === 'Param') {
          dropElement.appendChild(dragElement);
        }
      } else {
        dropElement.appendChild(dragElement);
      }
    } else {
      let ar: ScriptTreeDataNode[] = [];
      let i: number;
      loopTreeData(data, dropKey, (_item, index, arr) => {
        ar = arr;
        i = index;
      });
      let dropElement = xml.getElementById(dropKey as string) as Element;
      if (dropPosition === -1) {
        // ar.splice(i!, 0, dragObj!);
        // dropElement.before(dragElement);
      } else {
        ar.splice(i! + 1, 0, dragObj!);
        dropElement.after(dragElement);
      }
    }
    setTreeData(data);
    setScriptXML(xml);
  };

  const handleDebug = () => {
    setDebug(true);
  };

  const handleCloseDebug = () => {
    setDebug(false);
  };

  return (
    <>
      <Row gutter={24}>
        <Col>
          <Space size={'large'}>
            <Button type="primary" onClick={handleSave}>
              Save Plan
            </Button>
            <Button type="primary" onClick={handleDebug}>
              Debug
            </Button>
            <Button type="default" onClick={handleCancel}>
              Cancel
            </Button>
          </Space>
        </Col>
      </Row>
      <Row gutter={16} style={{ marginTop: '1.5em' }}>
        <Col span={4}>
          {/* {console.log(scriptXML)} */}

          <Tree
            // height={200}
            style={{ height: '50em', margin: '20px', overflowY: 'auto' }}
            showLine={true}
            defaultExpandAll={true}
            defaultExpandParent={true}
            defaultExpandedKeys={expendKeys}
            selectedKeys={selectKeys}
            onSelect={handleSelect}
            expandedKeys={expendKeys}
            draggable={true}
            onDrop={handleDrop}
            onExpand={(keys) => {
              // console.log(keys);
              setExpendKeys(keys);
            }}
            onRightClick={(e) => {
              e.event.preventDefault();
            }}
            treeData={treeData}
            titleRender={(node): ReactNode => {
              return (
                <Dropdown
                  overlay={<Menu items={dymMenu(node, handleMenuClick)} />}
                  trigger={['contextMenu']}
                >
                  <div className={node.enabled ? 'enabled' : 'disabled'}>
                    {node.title}
                  </div>
                </Dropdown>
              );
            }}
          />
        </Col>
        <Col span={20}>{selectKeys.length > 0 ? currentForm : <div></div>}</Col>
      </Row>
      {debug ? (
        <DebugModal
          title="Console Output"
          script={new XMLSerializer().serializeToString(scriptXML)}
          onClose={handleCloseDebug}
        />
      ) : (
        <div></div>
      )}
    </>
  );
};

const enableTreeNode = (
  list: ScriptTreeDataNode[],
  key: React.Key,
): ScriptTreeDataNode[] =>
  list.map((node) => {
    if (node.key === key) {
      node.enabled = !node.enabled;
    } else if (node.children) {
      node.children = enableTreeNode(node.children, key);
    }
    return node;
  });

const deleteTreeNode = (
  list: ScriptTreeDataNode[],
  key: React.Key,
): ScriptTreeDataNode[] => {
  let l = list.filter((item) => item.key !== key);
  return l.map((item) => {
    if (item.children) {
      item.children = deleteTreeNode(item.children, key);
    }
    return item;
  });
};

const updateTreeData = (
  list: ScriptTreeDataNode[],
  key: React.Key,
  children: ScriptTreeDataNode[],
): ScriptTreeDataNode[] =>
  list.map((node) => {
    if (node.key === key) {
      if (node.children) {
        node.children.push(...children);
      } else {
        return {
          ...node,
          children,
        };
      }
    }
    if (node.children) {
      return {
        ...node,
        children: updateTreeData(node.children, key, children),
      };
    }
    return node;
  });

const dymMenu = (
  node: ScriptTreeDataNode,
  clickHandler: (
    info: MenuInfo,
    node: ScriptTreeDataNode,
    label: string,
  ) => void,
): ItemType[] => {
  return [
    // {
    //     key: "Threads",
    //     label: "Add Threads",
    //     disabled: node && Object(SCRIPT_NODE_RULE)[node.category]? !Object(SCRIPT_NODE_RULE)[node.category].includes("Thread") : false,
    //     children: [
    //         {
    //             key: "ThreadGroup",
    //             label: "Thread Group",
    //             onClick: (obj) => clickHandler(obj, node, "Thread Group"),
    //         },
    //     ],
    // },
    {
      key: 'Controllers',
      label: 'Add Controllers',
      disabled:
        node && Object(SCRIPT_NODE_RULE)[node.category]
          ? !Object(SCRIPT_NODE_RULE)[node.category].includes('Controller')
          : false,
      children: [
        {
          key: 'LoopController',
          label: 'Loop Controller',
          onClick: (obj) => clickHandler(obj, node, 'Loop Controller'),
        },
        {
          key: 'IfController',
          label: 'If Controller',
          onClick: (obj) => clickHandler(obj, node, 'If Controller'),
        },
      ],
    },
    {
      key: 'Samplers',
      label: 'Add Samplers',
      disabled:
        node && Object(SCRIPT_NODE_RULE)[node.category]
          ? !Object(SCRIPT_NODE_RULE)[node.category].includes('Sampler')
          : false,
      children: [
        {
          key: 'HTTPSampler',
          label: 'HTTP Sampler',
          onClick: (obj) => clickHandler(obj, node, 'HTTP Sampler'),
        },
        {
          key: 'HelloSampler',
          label: 'Hello Sampler',
          onClick: (obj) => clickHandler(obj, node, 'Hello Sampler'),
        },
      ],
    },
    {
      key: 'Config',
      label: 'Add Config',
      disabled:
        node && Object(SCRIPT_NODE_RULE)[node.category]
          ? !Object(SCRIPT_NODE_RULE)[node.category].includes('Config')
          : false,
      children: [
        {
          key: 'Variable',
          label: 'Variable',
          onClick: (obj) => clickHandler(obj, node, 'Variable'),
        },
      ],
    },
    {
      key: 'PostProcessor',
      label: 'Add PostProcessor',
      disabled:
        node && Object(SCRIPT_NODE_RULE)[node.category]
          ? !Object(SCRIPT_NODE_RULE)[node.category].includes('PostProcessor')
          : false,
      children: [
        {
          key: 'RegExpExtractor',
          label: 'RegExp Extractor',
          onClick: (obj) => clickHandler(obj, node, 'RegExp Extractor'),
        },
        {
          key: 'JSONPathExtractor',
          label: 'JSON-Path Extractor',
          onClick: (obj) => clickHandler(obj, node, 'JSON-Path Extractor'),
        },
      ],
    },
    {
      key: 'Assertion',
      label: 'Add Assertion',
      disabled:
        node && Object(SCRIPT_NODE_RULE)[node.category]
          ? !Object(SCRIPT_NODE_RULE)[node.category].includes('Assertion')
          : false,
      children: [
        {
          key: 'ResponseAssertion',
          label: 'Response Assertion',
          onClick: (obj) => clickHandler(obj, node, 'Response Assertion'),
        },
      ],
    },
    {
      key: 'Enable',
      label: node.enabled ? 'Disable' : 'Enable',
      onClick: (obj) => clickHandler(obj, node, 'Enable'),
    },
    {
      key: 'Delete',
      label: 'Delete',
      onClick: (obj) => clickHandler(obj, node, 'Delete'),
    },
  ];
};

const parseTreeDataFromXML = (xml: Element): ScriptTreeDataNode[] => {
  let dataNodes: ScriptTreeDataNode[] = [];
  let node: ScriptTreeDataNode = {
    type:
      xml.getAttribute('type') !== null
        ? (xml.getAttribute('type') as string)
        : 'TestPlan',
    key:
      xml.getAttribute('id') !== null ? (xml.getAttribute('id') as string) : '',
    title: xml.getAttribute('label'),
    category:
      xml.getAttribute('category') !== null
        ? (xml.getAttribute('category') as string)
        : 'TestPlan',

    enabled: (xml.getAttribute('enabled') as string) === 'true',
  };

  for (let i = 0; i < xml.childElementCount; i++) {
    let child = xml.children[i];
    if (child.tagName !== 'Param') {
      let children = parseTreeDataFromXML(child);
      if (node.children) {
        node.children.push(...children);
      } else {
        node['children'] = children;
      }
    }
  }
  dataNodes.push(node);
  return dataNodes;
};

export default CreateOrUpdateScript;
