<template>
  <ul>
    <!--颜色的显示操作由父级组件来完成-->
    <!-- <li v-for="(item,index) in todos" :key="item.id"> -->
    <!--子级组件这边需要把每个数据传递给父级组件,但是最终父级组件处理后的数据需要在子级组件中进行展示-->
    <!--占位,使用插槽-->
    <!-- <slot :row="item" :$index="index"></slot>
    </li>-->

    <!-- 接受父级组件传递过来的todos，并遍历 -->
    <li v-for="(todo,index) in todos" :key="todo.id">
      <!-- 通过插槽将todos里的每一项以及索引传递给父级组件 -->
      <slot :row="todo" :$index="index"></slot>
    </li>
  </ul>
</template>

<script>
export default {
  name: 'List',
  props: {
    todos: Array
  }
}
</script>
