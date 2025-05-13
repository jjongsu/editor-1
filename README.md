# prosemirror editor 연습

## 연습 내용

1. `prosemirror-schema-basic`를 통해 기본 에디터 생성
   +) 버튼 클릭 시 현재 변경된 사항을 그대로 DOM에 그리기
2. 예제 [dino node](https://prosemirror.net/examples/dino/) 구현
3. 기본 가이드 - `maxSizePlugin` 구현
4. 3번 사항에서 응용 (editable변경 시 수정 불가했던 내용 수정)
5. Dark mode 적용(css활용)
6. taskList 구현(tiptap editor 구조 참고)
7. del mark 구현

---

## 아쉬운 점 및 궁금한 사항

-   taskList를 구현하면서 tiptap editor의 taskList와 Notion의 taskList가 다른 스키마를 사용하는 것으로 보이는데 이런 점들도 개발하고 있는 에디터에 적용 가능하도록 개발해야하는지?(`어떤 기저로 개발해야하는지?`)
    ex) Notion 에디터의 block을 복사해서 우리 에디터에 넣으면 잘 보여지게 되지만, Notion 에디터에 우리 에디터의 block을 붙여넣으면 깨질 수 있다?
-   schema를 처음에 이해할 때 content와 group에 들어가야하는 부분들에 대해서 어려움이 많았다. 이 부분들에 대한 개념을 확실하게 잡아야 한다.
-   taskList를 구현하면서 list관련한 라이브러리의 도움으로 구현했고, 관련 라이브러리를 봤을 때 많은 부분이 서로 연관되어 있음을 확인했다.
-   plugin의 순서는 어떤 연관이 있는지 아직 파악하지 못했는데, 6번 예제에서 enter키를 누르면 새로 taskItem이 생성되야하는데 그 부분에서 문제가 있었다. 어떤 순서로 plugin을 설정해야 하는지 확인이 필요하다.
