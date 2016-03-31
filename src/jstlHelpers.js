import { createElement } from './classes/Element';

export function cChoose(testValue, consequent, alternate) {
  const loneOption = (consequent && alternate) ? null : (consequent || alternate);
  const testInBrackets = '${'
    + (loneOption && alternate ? '!(' : '')
    + testValue
    + (loneOption && alternate ? ')' : '')
    + '}';

  return loneOption ?
    (<c:if test={testInBrackets} dangerouslySetInnerHTML={{ __html: loneOption }}>
    </c:if>)
    :
    (<c:choose>
      <c:when test={testInBrackets}>{consequent}</c:when>
      <c:otherwise>{alternate}</c:otherwise>
    </c:choose>);
}
