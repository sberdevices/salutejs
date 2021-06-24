import styled from 'styled-components';
import { Button } from '@sberdevices/plasma-ui';
import { signIn, signOut, useSession } from 'next-auth/client';

const Container = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 100px;
`;

const StyledButton = styled(Button)`
    margin-bottom: 16px;
`;

export default function Page() {
    const [session, loading] = useSession();

    return (
        <Container>
            {!session && (
                <>
                    <StyledButton autoFocus onClick={() => signIn()}>
                        Sign in
                    </StyledButton>
                    Not signed in <br />
                </>
            )}
            {session && (
                <>
                    <StyledButton onClick={() => signOut()}>Sign out</StyledButton>
                    <pre>{JSON.stringify(session, null, 2)}</pre>
                </>
            )}
        </Container>
    );
}
