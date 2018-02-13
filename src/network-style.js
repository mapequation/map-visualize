/**
 * @file This file dictates the appearance of the rendered network.
 * It defines a factory function that, given a set of nodes and links,
 * maps the defined ranges to the domain found in the data.
 *
 * @author Anton Eriksson
 */

import { scaleLinear, scaleSqrt } from 'd3-scale';
import { extent } from 'd3-array';


/**
 * Factory function to create style functions.
 *
 * @example
 *  const style = makeNetworkStyle({ nodes, links });
 *  const circle = svg.append('circle')
 *      .attr('r', style.nodeRadius)
 *      .style('fill', style.nodeFillColor)
 *      .style('stroke', style.nodeBorderColor)
 *      .style('stroke-width', style.nodeBorderWidth);
 *
 * @param {Object} opts
 * @param {Node[]} opts.nodes
 * @param {Object[]} opts.links
 */
export default function makeNetworkStyle({ nodes, links }) {
    const nodeRadius = scaleSqrt().domain(extent(nodes, n => n.flow)).range([20, 60]);
    const nodeFillColor = scaleLinear().domain(extent(nodes, n => n.flow)).range(['#E78321', '#650205']);
    const nodeBorderColor = scaleLinear().domain(extent(nodes, n => n.flow)).range(['#E78321', '#650205']);
    const nodeBorderWidth = scaleSqrt().domain(extent(nodes, n => n.exitFlow)).range([3, 7]);
    const linkFillColor = scaleLinear().domain(extent(links, l => l.flow)).range(['#ECF5F9', '#064575']);
    const linkWidth = scaleLinear().domain(extent(links, l => l.flow)).range([4, 10]);
    const linkOpacity = scaleLinear().domain(extent(links, l => l.flow)).range([0.8, 1]);
    const fontSize = scaleSqrt().domain(extent(nodes, n => n.flow)).range([7, 18]);

    return {
        nodeRadius: node => nodeRadius(node.flow),
        nodeFillColor: node => nodeFillColor(node.flow),
        nodeBorderColor: node => nodeBorderColor(node.exitFlow),
        nodeBorderWidth: node => nodeBorderWidth(node.exitFlow),
        linkFillColor: link => linkFillColor(link.flow),
        linkWidth: link => linkWidth(link.flow),
        linkOpacity: link => linkOpacity(link.flow),
        fontSize: node => fontSize(node.flow),
    };
}