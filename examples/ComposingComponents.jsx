import classNames from 'classnames';
import jsxQuery, { Component } from '../src/jsxquery';
import { bindAll } from './composingComponentsActions';
import * as composingComponentsActions from './composingComponentsActions';
// import ComposingComponentsItem from './ComposingComponentsItem';

class ComposingComponentsExample extends Component {
  initialState() {
    const item = (name, highlighted, bold) => ({name, highlighted, bold})
    return {
      itemList: [
        item('don\'t click them!!', false, true),
        item('click us!', false, false),
        item('yes click us, please!', false, false)
      ],
      itemFilter: 'ALL',
      boldItemIndex: 0,
    };
  }

  actionNames() {
    return [
      'startItemBold',
      'endItemBold',
      'startItemHighlight',
      'endItemHighlight',
      'filterItemListAll',
      'filterItemListBold',
      'filterItemListRegular',
    ];
  }

  selectItem(i) {
    this.actions().endItemBold(this.props.boldItemIndex)
          // this means we will need to search the component for this data.
          // is it in an attr? a container child?
          // 
          // also, before calling actionData,
          // we need to check if there are lists in state..
          // if there are lists, match for those patterns first.
    this.actions().startItemBold(i)
    this.actions().setBoldItemIndex(i);
  }

  render() {
    const { itemList, itemFilter, selectedItemIndex } = this.props;
    const { startItemBold,
      endItemBold,
      startItemHighlight,
      endItemHighlight,
      filterItemListAll,
      filterItemListBold,
      filterItemListRegular,
      setBoldItemIndex } = this.actions();

    const items = map(itemList, (item, i) => {
      const { highlighted, bold, name } = item;
      return (
        <li key={i}
            className={classNames({ highlighted, bold })}
            onClick={() => this.selectItem(i)}
            onMouseEnter={() => startItemHighlight(i)}
            // how to get it so highlight an item de-highlights the rest?
            // would it be against the point to allow these attributes to accept whole callbacks?
            // at least for animations, those callbacks will definitely be needed, though.
            //
            // on a slightly related note, maybe there should be a jsp translation of filter.
            // like, just an if check within a forEach jstl thing.
        >{name}</li>
      );
    });

    return (
      <ul id="composing-components-component">
        <input id="composing-components-input" value={''} onChange={}/>
        {items}
        <button onClick={() => filterItemListAll}>All</button>
        <button onClick={() => filterItemListBold}>Bold</button>
        <button onClick={() => filterItemListRegular}>Regular</button>
      </ul>
    );

  }
}

export default ComposingComponentsExample;
