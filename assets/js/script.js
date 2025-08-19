const body = document.querySelector('body');
const displayExpressionContainer = document.getElementById('display-expression-container');
const displayInputContainer = document.getElementById('display-input-container');
const displayExpression = document.getElementById('display-expression');
const displayInput = document.getElementById('display-input');
const buttons = document.querySelectorAll('.button');
const historyList = document.getElementById('history-list');
const btnDeleteAllHistory = document.getElementById('btn-delete-all-history');

// NumberFomratter를 사용하여 숫자 포맷팅
const numberFormatter = new Intl.NumberFormat('ko-KR', {
    maximumSignificantDigits: 14
});

const numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
const operators = ['+', '-', '*', '/', '^', '%'];
const ERORR_MESSAGES = {
    NaN: '계산 오류가 발생했습니다.',
    divideByZero: '0으로 나눌 수 없습니다.',
    Unknown: '입력이 잘못되었습니다.'
};
// 최대 자리수
const MAX_NUMBER_DIGITS = 13;

// 연산자를 입력 후 새로운 숫자를 처음 입력한지 확인하는 변수
let isOperatorEntered = false;

// 계산기에 입력된 숫자
let inputText = '0';

// 계산기에 입력된 수식
let expressionText = '';

// 버튼 클릭 이벤트
buttons.forEach(button => {
    button.addEventListener('click', () => {
        let key = button.innerText;
        // 특정 입력
        switch (key) {
            case "C": key = "Escape"; break;
            case "←": key = "Backspace"; break;
            case "x²": {
                handleInput("^");
                handleInput("2");
                handleInput("Enter");
                return;
            };
            case "÷": key = "/"; break;
            case "×": key = "*"; break;
            case "=": key = "Enter"; break;
        }
        handleInput(key);
    });
});

// 키보드 입력 이벤트
body.addEventListener('keydown', (event) => {
    // 입력된 키
    const key = event.key;
    handleInput(key);
});

// 기록 전부 삭제 버튼 클릭
btnDeleteAllHistory.addEventListener('click', () => {
    historyList.innerHTML = '';
});

// 계산기에 숫자나 연산자를 버튼 클릭/키보드 입력으로 추가하는 함수
function handleInput(key) {

    // 오류가 발생한 경우 입력값과 수식을 초기화
    if (Object.values(ERORR_MESSAGES).includes(displayInput.innerText)) {
        inputText = '0';
        expressionText = '';
    }

    // 숫자 키 입력 처리
    if (numbers.includes(key)) {
        const lastChar = expressionText.slice(-1);
        // 수식이 =로 끝난 경우, 새로운 입력으로 간주
        if (lastChar === '=') {
            inputText = key; // 새로운 입력값으로 설정
            expressionText = '';
        }
        // 수식이 연산자로 끝난 경우, 새로운 숫자로 대체
        else if (operators.includes(lastChar)) {
            if (!isOperatorEntered) {
                isOperatorEntered = true; // 연산자가 입력되었음을 표시
                inputText = key; // 새로운 입력값으로 설정
            }
            else {
                // 최대 자리 수 이상 입력하면 아무것도 하지 않음
                if (inputText.length >= MAX_NUMBER_DIGITS) return;
                inputText += key; // 기존 입력값에 숫자를 추가
            }
        }
        else {
            // 현재 입력이 '0'이면 새로운 숫자로 대체
            if (inputText === '0') {
                inputText = key;
            } else {
                // 최대 자리 수 이상 입력하면 아무것도 하지 않음
                if (inputText.length >= MAX_NUMBER_DIGITS) return;
                inputText += key;
            }
        }
    }
    // 원주율 입력 처리
    else if (key === 'π') {
        inputText = String(Math.PI);
    }
    // 소수점 키 입력 처리
    else if (key === '.') {
        // 현재 입력값에 소수점이 없으면 추가
        if (!inputText.includes('.')) {
            inputText += '.';
        }
    }
    // 백스페이스 키 입력 처리
    else if (key === 'Backspace') {
        inputText = inputText.slice(0, -1);

        // 입력이 비어있으면 '0'으로 설정
        if (inputText === '') {
            inputText = '0';
        }
    }
    // 'C' 키 입력 처리 (계산기 초기화)
    else if (key === 'Escape' || key === 'c' || key === 'C') {
        inputText = '0';
        expressionText = ''; // 계산식 초기화
    }
    // 엔터키 입력 처리
    else if (key === 'Enter') {
        // 수식이 =로 끝난 경우에 엔터를 추가 입력할 경우 마지막 연산을 한 번 더 진행
        if (expressionText.endsWith('=')) {
            // 예시 : expressionText가 `10 + 2 =` 일 경우 `12 + 2 =` 로 변경
            const fragments = expressionText.split(' ');
            if (fragments.length > 3) {
                const left = inputText;
                const right = fragments.slice(fragments.length - 3).join(' ');
                expressionText = left + " " + right;
            }
        }
        // 수식이 =로 끝나지 않은 경우
        else {
            // 현재 입력값을 계산식에 추가
            expressionText += ` ${inputText} =`;
        }

        // 연산을 끝냈으므로 연산자 입력 상태 초기화
        isOperatorEntered = false;

        // 계산 결과를 표시
        try {
            // 0으로 나누기 오류 처리
            if (/\/\s*0(\D|$)/.test(expressionText)) {
                displayInput.innerText = ERORR_MESSAGES.divideByZero;
                resizeToFitContent(displayInputContainer);
                return;
            }
            // eval 함수를 사용하여 계산
            // javascript는 제곱 기호가 ^에서 **로 바뀌어야 함
            const result = eval(expressionText.replace('=', '').replace(/\^/g, '**'));
            if (result === Infinity || result === -Infinity) {
                displayInput.innerText = ERORR_MESSAGES.Unknown;
                resizeToFitContent(displayInputContainer);
                return;
            }
            if (isNaN(result)) {
                displayInput.innerText = ERORR_MESSAGES.NaN;
                resizeToFitContent(displayInputContainer);
                return;
            }
            inputText = result.toString();
            // 계산식 초기화
            // displayExpression.innerText = '';
            // 계산 기록 추가
            addHistory(inputText, expressionText);

        } catch (error) {
            console.log(error);
            displayInput.innerText = ERORR_MESSAGES.Unknown; // 오류 메시지 표시
            resizeToFitContent(displayInputContainer);
            return;
        }
    }
    // 연산자 키 입력 처리 (예: +, -, *, / 등)
    else if (operators.includes(key)) {
        // 수식이 =로 끝난 경우, 수식 초기화
        if (expressionText.endsWith('=')) {
            expressionText = ` ${inputText} ${key}`;
        }
        // 
        else {
            expressionText += ` ${inputText} ${key}`;
        }
        // 연산자 입력을 끝냈으므로 연산자 입력 상태 초기화
        isOperatorEntered = false;
    }

    // console.log(`입력된 값: ${inputText}, 키: ${key}`);
    displayInput.innerText = formatInput(inputText);
    displayExpression.innerText = formatExpression(expressionText);

    // 입력값과 수식의 폰트 크기를 조정
    resizeToFitContent(displayInputContainer);
    resizeToFitContent(displayExpressionContainer);
}

// input 요소의 텍스트 길이에 따라 폰트 크기를 조정하는 함수
function resizeToFitContent(element) {
    element.style.setProperty('--font-size', '48px'); // 초기 폰트 크기 설정
    const { width: max_width, height: max_height } = element.getBoundingClientRect();
    const { width, height } = element.children[0].getBoundingClientRect();
    const size = Math.min(max_width / width, max_height / height) * 0.9; // 폰트 크기를 조정하는 비율
    // console.log(`max_width: ${max_width}, max_height: ${max_height}, width: ${width}, height: ${height}, size: ${size}`);
    element.style.setProperty('--font-size', size * 48 + 'px');
}

// 계산 기록을 추가하는 함수
function addHistory(inputText, expressionText) {
    const historyItem = document.createElement('li');
    historyItem.classList.add('history-item');

    const historyExpression = document.createElement('span');
    historyExpression.classList.add('history-expression');
    historyExpression.innerText = formatExpression(expressionText) + ' ';
    historyItem.appendChild(historyExpression);

    const historyResult = document.createElement('span');
    historyResult.classList.add('history-result');
    historyResult.innerText = formatInput(inputText);
    historyItem.appendChild(historyResult);

    const deleteButton = document.createElement('button');
    deleteButton.classList.add('btn-delete');
    deleteButton.innerText = '삭제';
    deleteButton.addEventListener('mousedown', () => {
        historyItem.remove();
    });
    historyItem.appendChild(deleteButton);

    historyList.insertBefore(historyItem, historyList.firstElementChild);
}

// 화면에 보여줄 포매팅된 입력된 숫자
function formatInput(inputText) {
    const endsWithDecimal = inputText.endsWith('.');
    inputText = numberFormatter.format(Number.parseFloat(inputText));
    if (endsWithDecimal) inputText += '.';
    return inputText;
}

// 화면에 보여줄 포매팅된 입력된 수식
function formatExpression(expressionText) {
    return expressionText.replace('/', '÷').replace('*', '×');
}