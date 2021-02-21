<template>
  <v-dialog origin="bottom right" v-bind="$attrs">
    <v-card>
      <v-card-text>
        <QRCode :pre="pre" :size="size">{{ content }}</QRCode>
      </v-card-text>
    </v-card>
    <template v-slot:activator="{ on }">
      <slot v-on="on" name="activator"
    /></template>
  </v-dialog>
</template>
<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";
@Component
export default class QRCodeDialog extends Vue {
  name = "QRCodeDialog";
  @Prop(String)
  content!: string;
  @Prop(Number)
  size!: number;
  @Prop({ default: false })
  pre!: boolean;
}
</script>

