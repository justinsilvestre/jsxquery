const aliasedEvents = {
  onChange: 'change input',
  onDoubleClick: 'dblclick',
};

const events = `
  onCopy onCut onPaste
  onCompositionEnd onCompositionStart onCompositionUpdate
  onFocus onBlur
  onInput onSubmit
  onClick onContextMenu
  onDrag onDragEnd onDragEnter onDragExit
    onDragLeave onDragOver onDragStart onDrop
    onMouseDown onMouseEnter onMouseLeave
    onMouseMove onMouseOut onMouseOver onMouseUp
  onSelect
  onTouchCancel onTouchEnd onTouchMove onTouchStart
  onScroll
  onWheel
  onAbort onCanPlay onCanPlayThrough onDurationChange
    onEmptied onEncrypted onEnded onError onLoadedData
    onLoadedMetadata onLoadStart onPause onPlay
    onPlaying onProgress onRateChange onSeeked onSeeking
    onStalled onSuspend onTimeUpdate onVolumeChange onWaiting
`.trim().split(/\s+/)
  .reduce((obj, eventName) => {
    return Object.assign(obj, { [eventName]: eventName.slice(2).toLowerCase() });
  }, aliasedEvents);

module.exports = events;