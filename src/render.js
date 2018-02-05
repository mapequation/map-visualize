import * as d3 from 'd3';
import { halfLink, undirectedLink } from 'network-rendering';

const makeGraphStyle = (nodes, links) => {
    const scaleLinear = (array, accessor, range) =>
        d3.scaleLinear()
            .domain(d3.extent(array, obj => obj[accessor]))
            .range(range);

    const nodeRadius = scaleLinear(nodes, 'flow', [10, 60]);
    const nodeFillColor = scaleLinear(nodes, 'flow', ['#DFF1C1', '#C5D7A8']);
    const nodeBorderColor = scaleLinear(nodes, 'exitFlow', ['#ABD65B', '#95C056']);
    const nodeBorderWidth = scaleLinear(nodes, 'exitFlow', [1, 5]);

    const linkFillColor = scaleLinear(links, 'flow', ['#71B2D7', '#418EC7']);
    const linkWidth = scaleLinear(links, 'flow', [3, 9]);
    const linkOpacity = scaleLinear(links, 'flow', [1, 1]);

    return {
        node: {
            fillColor: node => nodeFillColor(node.flow),
            borderColor: node => nodeBorderColor(node.exitFlow),
            radius: node => nodeRadius(node.flow),
            borderWidth: node => nodeBorderWidth(node.exitFlow),
        },
        link: {
            fillColor: link => linkFillColor(link.flow),
            width: link => linkWidth(link.flow),
            opacity: link => linkOpacity(link.flow),
        },
    };
};

const makeDragHandler = simulation => ({
    dragStarted: (node) => {
        if (!d3.event.active) simulation.alphaTarget(0.3).restart();
        node.fx = node.x;
        node.fy = node.y;
    },

    drag: (node) => {
        node.fx = d3.event.x;
        node.fy = d3.event.y;
    },

    dragEnded: (node) => {
        if (!d3.event.active) simulation.alphaTarget(0);
        node.fx = null;
        node.fy = null;
    },
});

/**
  * Render all direct children to a node.
  *
 * @param {Node[]} nodes
 * @param {Object[]} links
 * @param {Object} params
 */
export default function render(
    nodes,
    links,
    {
        charge = 500,
        linkDistance = 100,
        linkType = 'directed',
    } = {},
) {
    const width = window.innerWidth;
    const height = window.innerHeight;

    const style = makeGraphStyle(nodes, links);

    const linkSvgPath = (linkType === 'directed' ? halfLink : undirectedLink)()
        .nodeRadius(style.node.radius)
        .width(style.link.width);

    const simulation = d3.forceSimulation()
        .force('collide', d3.forceCollide(20)
            .radius(style.node.radius))
        .force('link', d3.forceLink()
            .distance(linkDistance)
            .id(d => d.id))
        .force('charge', d3.forceManyBody()
            .strength(-charge)
            .distanceMax(400))
        .force('center', d3.forceCenter(width / 2, height / 2));

    const dragHandler = makeDragHandler(simulation);

    const svg = d3.select('svg')
        .attr('width', width)
        .attr('height', height)
        .call(d3.zoom().on('zoom', () => svg.attr('transform', d3.event.transform)))
        .append('g');

    const link = svg.append('g')
        .attr('class', 'links')
        .selectAll('line')
        .data(links)
        .enter()
        .append('path')
        .attr('class', 'link')
        .style('fill', style.link.fillColor)
        .style('opacity', style.link.opacity)
        .on('click', d => console.log(d));

    const node = svg.append('g')
        .attr('class', 'nodes')
        .selectAll('.node')
        .data(nodes)
        .enter()
        .append('g')
        .attr('class', 'node')
        .on('click', d => console.log(d))
        .call(d3.drag()
            .on('start', dragHandler.dragStarted)
            .on('drag', dragHandler.drag)
            .on('end', dragHandler.dragEnded));

    const circle = node.append('circle')
        .attr('r', style.node.radius)
        .style('fill', style.node.fillColor)
        .style('stroke', style.node.borderColor)
        .style('stroke-width', style.node.borderWidth);

    const text = node.append('text')
        .text(n => n.name || n.id)
        .attr('text-anchor', 'middle')
        .attr('dy', '0.35em');

    const ticked = () => {
        circle.attr('cx', n => n.x)
            .attr('cy', n => n.y);
        text.attr('x', n => n.x)
            .attr('y', n => n.y);
        link.attr('d', linkSvgPath);
    };

    simulation
        .nodes(nodes)
        .on('tick', ticked);

    simulation
        .force('link')
        .links(links);
}
