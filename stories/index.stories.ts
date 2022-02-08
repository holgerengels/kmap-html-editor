import { html, TemplateResult } from 'lit-element';
import '../src/kmap-html-editor.js';

export default {
  title: 'KmapHtmlEditor',
  component: 'kmap-html-editor',
  argTypes: {
    value: { control: 'text' },
  },
};

interface Story<T> {
  (args: T): TemplateResult;
  args?: Partial<T>;
  argTypes?: Record<string, unknown>;
}

interface ArgTypes {
  value?: string;
}

const Template: Story<ArgTypes> = ({
  value = '<p>Test</p>',
}: ArgTypes) => html`
  <kmap-html-editor
    .value=${value}
  >
  </kmap-html-editor>
`;

export const Regular = Template.bind({});

export const CustomExpression = Template.bind({});
CustomExpression.args = {
  value: '<p>Test</p>',
};
