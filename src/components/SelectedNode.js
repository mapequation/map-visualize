import PropTypes from "prop-types";
import React, { useContext, useLayoutEffect, useState } from "react";
import { Input, Popup, Table } from "semantic-ui-react";
import Dispatch from "../context/Dispatch";


const count = (items) => {
  const visibleCount = items.filter(item => item.shouldRender).length;
  if (visibleCount === items.length) {
    return items.length;
  }
  return <span>{items.length} <span style={{ color: "#999" }}>({visibleCount})</span></span>;
};

export default function SelectedNode(props) {
  const { node, directed } = props;
  const [name, setName] = useState(node.name);
  const dispatch = useContext(Dispatch);

  const handleChange = (e, { value }) => {
    node.name = value;
    setName(value);
    dispatch({ type: "selectedNodeNameChange" });
  };

  useLayoutEffect(() => {
    setName(node.name);
  }, [node]);

  const isRoot = node.path.toString() === "root";

  return (
    <Table celled singleLine striped compact>
      <Table.Body>
        <Table.Row>
          <Popup
            trigger={<Table.Cell width={5} content='Name'/>}
            size='tiny'
            content='The node name, or the names of the largest nodes contained within.'
          />
          <Table.Cell selectable style={{ padding: "0 0 0 8px" }}>
            <Input
              transparent
              fluid
              value={name}
              onChange={handleChange}
            />
          </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Popup
            trigger={<Table.Cell content='Tree path'/>}
            size='tiny'
            content='Colon separated path in the tree from the root to finest-level modules.'
          />
          <Table.Cell content={node.path.toString()}/>
        </Table.Row>
        <Table.Row>
          <Popup
            trigger={<Table.Cell content='Flow'/>}
            size='tiny'
            content='The flow contained in this node.'
          />
          <Table.Cell content={node.flow.toPrecision(4)}/>
        </Table.Row>
        {node.exitFlow > 0 &&
        <Table.Row>
          <Popup
            trigger={<Table.Cell content='Exit flow'/>}
            size='tiny'
            content='The module exit flow.'
          />
          <Table.Cell content={node.exitFlow.toPrecision(4)}/>
        </Table.Row>
        }
        {isRoot && directed &&
        <Table.Row>
          <Popup
            trigger={<Table.Cell content='In degree'/>}
            size='tiny'
            content='The number of incoming links to this node.'
          />
          <Table.Cell content={node.kin}/>
        </Table.Row>
        }
        {isRoot && directed &&
        <Table.Row>
          <Popup
            trigger={<Table.Cell content='Out degree'/>}
            size='tiny'
            content='The number of outgoing links from this node.'
          />
          <Table.Cell content={node.kout}/>
        </Table.Row>
        }
        {isRoot && !directed &&
        <Table.Row>
          <Popup
            trigger={<Table.Cell content='Degree'/>}
            size='tiny'
            content='The number of links to this node.'
          />
          <Table.Cell content={node.kin + node.kout}/>
        </Table.Row>
        }
        {node.nodes &&
        <Table.Row>
          <Popup
            trigger={<Table.Cell content='Nodes'/>}
            size='tiny'
            content='The number of nodes contained within this module.'
          />
          <Popup
            trigger={<Table.Cell content={count(node.nodes)}/>}
            size='tiny'
            content='Total (Visible)'
          />
        </Table.Row>
        }
        {node.links &&
        <Table.Row>
          <Popup
            trigger={<Table.Cell content='Links'/>}
            size='tiny'
            content='The number of links contained within this module.'
          />
          <Popup
            trigger={<Table.Cell content={count(node.links)}/>}
            size='tiny'
            content='Total (Visible)'
          />
        </Table.Row>
        }
        {node.totalChildren != null &&
        <Table.Row>
          <Popup
            trigger={<Table.Cell content='Children'/>}
            size='tiny'
            content='The total number of nodes contained within this module and its children.'
          />
          <Table.Cell content={node.totalChildren}/>
        </Table.Row>
        }
      </Table.Body>
    </Table>
  );
}

SelectedNode.propTypes = {
  node: PropTypes.shape({
    name: PropTypes.string,
    path: PropTypes.object,
    kin: PropTypes.number,
    kout: PropTypes.number,
    flow: PropTypes.number,
    exitFlow: PropTypes.number,
    nodes: PropTypes.array,
    links: PropTypes.array,
    totalChildren: PropTypes.number
  }).isRequired,
  onNameChange: PropTypes.func,
  directed: PropTypes.bool
};

SelectedNode.defaultProps = {
  onNameChange: () => null
};
