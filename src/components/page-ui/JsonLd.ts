import { defineComponent, h, type PropType } from "vue";

export default defineComponent({
  name: "JsonLd",
  props: {
    data: { type: Object as PropType<Record<string, unknown>>, required: true },
  },
  setup(props) {
    return () => h("script", {
      type: "application/ld+json",
      innerHTML: JSON.stringify(props.data).replace(/</g, "\\u003c"),
    });
  },
});
