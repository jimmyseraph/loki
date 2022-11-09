export function generateParamElement(
  name: string,
  type: string,
  value: string,
): Element {
  let paramElement = document.createElementNS('', 'Param');
  paramElement.setAttribute('name', name);
  paramElement.setAttribute('type', type);
  paramElement.textContent = value;
  return paramElement;
}

export function generateParamElementWithCData(
  name: string,
  type: string,
  value: CDATASection,
): Element {
  let paramElement = document.createElementNS('', 'Param');
  paramElement.setAttribute('name', name);
  paramElement.setAttribute('type', type);
  paramElement.appendChild(value);
  return paramElement;
}

export function generateComponentElement(
  id: string,
  label: string,
  type: string,
  category: string,
  enabled: string,
): Element {
  let node = document.createElementNS('', 'Component');
  node.setAttribute('id', id);
  node.setAttribute('label', label);
  node.setAttribute('type', type);
  node.setAttribute('category', category);
  node.setAttribute('enabled', enabled);
  return node;
}

export function setParamValue(
  xml: Element,
  name: string,
  value: string,
  type?: string,
) {
  let paramElement = getParamElement(xml, name);
  if (paramElement) {
    paramElement.innerHTML = value;
  } else {
    let newParamElement = generateParamElement(name, type!, value);
    xml.prepend(newParamElement);
  }
}

export function setParamValueAsCDATA(
  doc: XMLDocument,
  xml: Element,
  name: string,
  value: string,
  type?: string,
) {
  let paramElement = getParamElement(xml, name);
  let cdata = doc.createCDATASection(value);
  if (paramElement) {
    paramElement.innerHTML = '';
    paramElement.appendChild(cdata);
  } else {
    let newParamElement = generateParamElementWithCData(name, type!, cdata);
    xml.prepend(newParamElement);
  }
}

export function setParamArray(
  xml: Element,
  name: string,
  values: string[],
  type?: string,
) {
  getParamElements(xml, name).forEach(
    (element: Element, index: number, array: Element[]): void => {
      xml.removeChild(element);
    },
  );

  let array = values.map((value) => generateParamElement(name, type!, value));
  xml.prepend(...array);
}

export function setParamArrayWithElements(xml: Element, children: Element[]) {
  getParamElements(xml).forEach(
    (element: Element, index: number, array: Element[]): void => {
      xml.removeChild(element);
    },
  );
  xml.prepend(...children);
}

export function getParamElement(
  xmlNode: Element,
  name: string,
): Element | null {
  for (let i = 0; i < xmlNode.childElementCount; i++) {
    if (
      xmlNode.children[i].tagName === 'Param' &&
      xmlNode.children[i].getAttribute('name') === name
    ) {
      return xmlNode.children[i];
    }
  }
  return null;
}

export function getParamElements(xmlNode: Element, name?: string): Element[] {
  let elements: Element[] = [];
  for (let i = 0; i < xmlNode.childElementCount; i++) {
    if (name) {
      if (
        xmlNode.children[i].tagName === 'Param' &&
        xmlNode.children[i].getAttribute('name') === name
      ) {
        elements.push(xmlNode.children[i]);
      }
    } else {
      if (xmlNode.children[i].tagName === 'Param') {
        elements.push(xmlNode.children[i]);
      }
    }
  }
  return elements;
}

export function removeParamElement(
  xmlNode: Element,
  name: string,
  value?: string,
) {
  getParamElements(xmlNode, name)?.forEach(
    (element: Element, index: number, array: Element[]): void => {
      if (value) {
        if (element.textContent === value) {
          xmlNode.removeChild(element);
        }
      } else {
        xmlNode.removeChild(element);
      }
    },
  );
}

export const SCRIPT_NODE_RULE = {
  TestPlan: ['Thread', 'Config', 'Sampler'],
  Thread: ['Controller', 'Sampler', 'Config'],
  Controller: ['Controller', 'Sampler', 'Config'],
  Sampler: ['Config', 'PostProcessor', 'Assertion'],
  PostProcessor: [],
  Config: [],
  Assertion: [],
};
