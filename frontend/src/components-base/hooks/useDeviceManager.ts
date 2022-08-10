export const useDeviceManager = () => {

    const firstAccessToDevice = async () => {
        navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true,
        })
    }
    const getAudioInputDevices = async () => {
        firstAccessToDevice()
        const mediaDeviceInfos = await navigator.mediaDevices.enumerateDevices();
        return mediaDeviceInfos.filter((x) => {
            return x.kind === "audioinput";
        });
    };

    const getVideoInputDevices = async () => {
        firstAccessToDevice()
        const mediaDeviceInfos = await navigator.mediaDevices.enumerateDevices();
        return mediaDeviceInfos.filter((x) => {
            return x.kind === "videoinput";
        });
    };

    const getAudioOutputDevices = async () => {
        firstAccessToDevice()
        const mediaDeviceInfos = await navigator.mediaDevices.enumerateDevices();
        return mediaDeviceInfos.filter((x) => {
            return x.kind === "audiooutput";
        });
    };
    return { getAudioInputDevices, getVideoInputDevices, getAudioOutputDevices, firstAccessToDevice };
};

