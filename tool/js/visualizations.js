/**
 * Breast Cancer Risk Assessment Tool - Visualizations
 * D3.js-based population prevalence grids for risk display
 *
 * Adapted from: https://github.com/jeyabbalas/risk-viz
 */

/**
 * Creates a population prevalence grid visualization using D3.js
 * Displays a 10x10 grid of person icons with colored icons representing risk percentage
 *
 * @returns {Function} Configured visualization function
 */
export function populationPrevalenceGrid() {
  // Default configuration
  let width = 400;
  let height = 400;
  let prevalence = 0;
  let colorCase = '#dc3545';  // Red for patient risk
  let colorControl = '#e9ecef';  // Light gray for non-cases
  let labelCase = 'At Risk';
  let labelControl = 'Not At Risk';
  let fontSize = 14;
  let margin = { top: 10, right: 10, bottom: 10, left: 10 };

  /**
   * Main visualization function
   * @param {d3.Selection} selection - D3 selection to render into
   */
  const visualizationFunction = (selection) => {
    const gridSize = 10;
    const legendWidth = width / 3.1;
    const plotWidth = width - legendWidth;
    const cellSize = (plotWidth - margin.left - margin.right) / gridSize;
    const legendRectSize = cellSize / 2;
    const offset = 2;
    const legendOffset = 15;

    // Generate unique gradient ID for this visualization
    const uniqueId = `gradient-${Math.random().toString(36).substr(2, 9)}`;

    // Calculate number of colored icons based on prevalence
    const numColored = Math.floor(gridSize * gridSize * (prevalence / 100));
    const fractionalPrevalence = gridSize * gridSize * (prevalence / 100) - numColored;

    // Create data array for person icons
    const personData = Array.from({ length: gridSize * gridSize }, (_, i) => ({
      index: i,
      color: i < numColored ? colorCase : colorControl
    }));

    // SVG path for person icon
    const personPath = 'm62.096 8.5859c-5.208 0-9.424 4.2191-9.424 9.4261 0.001 5.203 4.217 9.424 9.424 9.424 5.202 0 9.422-4.221 9.422-9.424 0-5.208-4.22-9.4261-9.422-9.4261zm-10.41 21.268c-6.672 0-12.131 5.407-12.131 12.07v29.23c0 2.275 1.791 4.123 4.07 4.123 2.28 0 4.127-1.846 4.127-4.123v-26.355h2.102s0.048 68.811 0.048 73.331c0 3.05 2.478 5.53 5.532 5.53 3.052 0 5.525-2.48 5.525-5.53v-42.581h2.27v42.581c0 3.05 2.473 5.53 5.531 5.53 3.054 0 5.549-2.48 5.549-5.53v-73.331h2.127v26.355c0 2.275 1.85 4.123 4.126 4.123 2.28 0 4.073-1.846 4.073-4.123v-29.23c0-6.663-5.463-12.07-12.129-12.07h-20.82z';

    // Create or update SVG
    const svg = selection
      .selectAll('svg.population-prevalence-grid')
      .data([null])
      .join('svg')
      .attr('class', 'population-prevalence-grid')
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${plotWidth}`)
      .attr('font-family', 'sans-serif');

    // Population border
    svg
      .selectAll('.population-border')
      .data([null])
      .join('rect')
      .attr('class', 'population-border')
      .attr('width', plotWidth)
      .attr('height', plotWidth)
      .attr('fill', 'none')
      .attr('stroke', '#333')
      .attr('stroke-width', 2)
      .attr('transform', `translate(${offset}, ${offset})`);

    // Create gradient for fractional icon
    const defs = svg
      .selectAll('defs')
      .data([null])
      .join('defs');

    const colorGradient = defs
      .selectAll(`#${uniqueId}`)
      .data([null])
      .join('linearGradient')
      .attr('id', uniqueId)
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '0%');

    colorGradient
      .selectAll('stop.start-case')
      .data([null])
      .join('stop')
      .attr('class', 'start-case')
      .attr('offset', '0%')
      .attr('stop-color', colorCase);

    colorGradient
      .selectAll('stop.middle-case')
      .data([null])
      .join('stop')
      .attr('class', 'middle-case')
      .attr('offset', `${fractionalPrevalence * 100}%`)
      .attr('stop-color', colorCase);

    colorGradient
      .selectAll('stop.middle-control')
      .data([null])
      .join('stop')
      .attr('class', 'middle-control')
      .attr('offset', `${fractionalPrevalence * 100}%`)
      .attr('stop-color', colorControl);

    colorGradient
      .selectAll('stop.end-control')
      .data([null])
      .join('stop')
      .attr('class', 'end-control')
      .attr('offset', '100%')
      .attr('stop-color', colorControl);

    // Create person icons
    const person = svg
      .selectAll('g.person')
      .data(personData, d => d.index);

    const personEnter = person
      .enter()
      .append('g')
      .attr('class', 'person');

    const personUpdate = personEnter
      .merge(person)
      .attr('transform', (d, i) => {
        const x = margin.left + (i % gridSize) * cellSize + offset;
        const y = margin.top + Math.floor(i / gridSize) * cellSize + offset;
        const scale = cellSize / 124.19;
        return `translate(${x}, ${y}) scale(${scale})`;
      });

    personUpdate
      .selectAll('path')
      .data(d => [d])
      .join('path')
      .attr('d', personPath)
      .attr('fill', d => {
        if (d.index === numColored && fractionalPrevalence > 0) {
          return `url(#${uniqueId})`;
        }
        return d.color;
      });

    person.exit().remove();

    // Create legend
    const legend = svg
      .selectAll('g.population-legend')
      .data([null])
      .join('g')
      .attr('class', 'population-legend')
      .attr('transform', `translate(${plotWidth + legendOffset}, ${margin.top + legendOffset})`);

    legend
      .selectAll('rect.legend-border')
      .data([null])
      .join('rect')
      .attr('class', 'legend-border')
      .attr('width', legendWidth - 20)
      .attr('height', legendRectSize * 4)
      .attr('fill', 'none')
      .attr('stroke', '#333')
      .attr('stroke-width', 1);

    // Case color legend
    legend
      .selectAll('rect.legend-case-color')
      .data([null])
      .join('rect')
      .attr('class', 'legend-case-color')
      .attr('x', legendRectSize / 2)
      .attr('y', legendRectSize / 2)
      .attr('width', legendRectSize)
      .attr('height', legendRectSize)
      .attr('fill', colorCase)
      .attr('stroke', '#333')
      .attr('stroke-width', 1);

    legend
      .selectAll('text.legend-case-label')
      .data([null])
      .join('text')
      .attr('class', 'legend-case-label')
      .attr('x', legendRectSize * 2)
      .attr('y', cellSize / 2)
      .attr('dy', '.35em')
      .text(labelCase)
      .style('font-size', `${fontSize}px`);

    // Control color legend
    legend
      .selectAll('rect.legend-control-color')
      .data([null])
      .join('rect')
      .attr('class', 'legend-control-color')
      .attr('x', legendRectSize / 2)
      .attr('y', (legendRectSize * 4) / 2 + legendRectSize / 2)
      .attr('width', legendRectSize)
      .attr('height', legendRectSize)
      .attr('fill', colorControl)
      .attr('stroke', '#333')
      .attr('stroke-width', 1);

    legend
      .selectAll('text.legend-control-label')
      .data([null])
      .join('text')
      .attr('class', 'legend-control-label')
      .attr('x', legendRectSize * 2)
      .attr('y', cellSize + cellSize / 2)
      .attr('dy', '.35em')
      .text(labelControl)
      .style('font-size', `${fontSize}px`);
  };

  // Getter/setter methods for configuration
  visualizationFunction.width = function (_) {
    return arguments.length ? ((width = +_), visualizationFunction) : width;
  };

  visualizationFunction.height = function (_) {
    return arguments.length ? ((height = +_), visualizationFunction) : height;
  };

  visualizationFunction.prevalence = function (_) {
    return arguments.length ? ((prevalence = +_), visualizationFunction) : prevalence;
  };

  visualizationFunction.colorCase = function (_) {
    return arguments.length ? ((colorCase = _), visualizationFunction) : colorCase;
  };

  visualizationFunction.colorControl = function (_) {
    return arguments.length ? ((colorControl = _), visualizationFunction) : colorControl;
  };

  visualizationFunction.labelCase = function (_) {
    return arguments.length ? ((labelCase = _), visualizationFunction) : labelCase;
  };

  visualizationFunction.labelControl = function (_) {
    return arguments.length ? ((labelControl = _), visualizationFunction) : labelControl;
  };

  visualizationFunction.fontSize = function (_) {
    return arguments.length ? ((fontSize = +_), visualizationFunction) : fontSize;
  };

  visualizationFunction.margin = function (_) {
    return arguments.length ? ((margin = _), visualizationFunction) : margin;
  };

  return visualizationFunction;
}

/**
 * Renders a risk comparison visualization (patient vs average)
 *
 * @param {string} containerId - DOM element ID for patient risk grid
 * @param {string} averageContainerId - DOM element ID for average risk grid
 * @param {number} patientRisk - Patient's risk percentage (0-100)
 * @param {number} averageRisk - Average risk percentage (0-100)
 * @param {string} type - Type of risk ('5-year' or 'lifetime')
 */
export function renderRiskComparison(containerId, averageContainerId, patientRisk, averageRisk, type = '5-year') {
  // Determine grid size based on viewport
  const containerWidth = Math.min(window.innerWidth * 0.5, 600);
  const gridSize = containerWidth;

  // Patient risk grid
  const patientGrid = populationPrevalenceGrid()
    .width(gridSize)
    .height(gridSize)
    .prevalence(patientRisk)
    .colorCase('#dc3545')
    .colorControl('#e9ecef')
    .labelCase('At Risk')
    .labelControl('Not At Risk')
    .fontSize(14);

  d3.select(`#${containerId}`)
    .selectAll('*')
    .remove();

  d3.select(`#${containerId}`)
    .call(patientGrid);

  // Average risk grid
  const averageGrid = populationPrevalenceGrid()
    .width(gridSize)
    .height(gridSize)
    .prevalence(averageRisk)
    .colorCase('#007bff')
    .colorControl('#e9ecef')
    .labelCase('At Risk')
    .labelControl('Not At Risk')
    .fontSize(14);

  d3.select(`#${averageContainerId}`)
    .selectAll('*')
    .remove();

  d3.select(`#${averageContainerId}`)
    .call(averageGrid);
}

/**
 * Clears all visualizations from the page
 */
export function clearVisualizations() {
  const vizIds = [
    'viz-5year-patient',
    'viz-5year-average',
    'viz-lifetime-patient',
    'viz-lifetime-average'
  ];

  vizIds.forEach(id => {
    d3.select(`#${id}`).selectAll('*').remove();
  });
}
