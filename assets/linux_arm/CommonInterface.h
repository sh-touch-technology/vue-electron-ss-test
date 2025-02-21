#pragma once

//#ifdef WINDOWS
//#define DLL_API __stdcall
//#else
	#define DLL_API 
//#endif

#ifdef __cplusplus
extern "C"
{
#endif

long DLL_API SetTerminalLibrary(char *LibraryFileName);
long DLL_API SetAutoPara(char *PortType, char *PortPara, char *ExtendPara, char *DllName = (char*)"TerminalProtocol.dll", int UsingGA467 = 0);
long DLL_API OpenDevice(char *PortType, char *PortPara, char *ExtendPara);
long DLL_API SetCurrentDevice(long DevHandle);
long DLL_API GetCurrentDevice();
long DLL_API CloseDevice();
long DLL_API CommandTransmit(unsigned long Command, long CmdDataLength, unsigned char *CmdData, unsigned char *StatusWords, long *RecvDataLength, unsigned char *RecvData, unsigned long TimeOut);
long DLL_API GA467Transmit(unsigned long Command, long CmdDataLength, unsigned char *CmdData, unsigned char *StatusWords, long *RecvDataLength, unsigned char *RecvData, unsigned long TimeOut);
long DLL_API TerminalGetModel(char *TerminalModel);
long DLL_API TerminalGetFirmVersion(char *FirmVersion, char *HardwareVersion);
long DLL_API TerminalHeartBeat();
long DLL_API GetLastRecvData(unsigned char *LastRecvData);

long DLL_API IdFindCard();
long DLL_API IdSelectCard();
long DLL_API IdReadBaseMsg(unsigned char *pucCHMsg, long *puiCHMsgLen, unsigned char *pucPHMsg, long *puiPHMsgLen);
long DLL_API IdReadBaseFpMsg(unsigned char *pucCHMsg, long *puiCHMsgLen, unsigned char *pucPHMsg, long *puiPHMsgLen, unsigned char *pucFPMsg, long *puiFPMsgLen);
long DLL_API IdReadNewAppMsg(unsigned char *pucAppMsg, long *puiAppMsgLen);
long DLL_API IdReadSn(unsigned char *SN, long *SNLen);
long DLL_API IdApdu(long SendApduLen, unsigned char *SendApdu, unsigned char *RecvApdu, long *RecvApduLen);
long DLL_API SdtFindCard(unsigned char *pucManaInfo);
long DLL_API SdtSelectCard(unsigned char *pucManaMsg);
long DLL_API SdtReadBaseMsg(unsigned char *pucCHMsg, long *puiCHMsgLen, unsigned char *pucPHMsg, long *puiPHMsgLen);
long DLL_API SdtReadBaseFpMsg(unsigned char *pucCHMsg, long *puiCHMsgLen, unsigned char *pucPHMsg, long *puiPHMsgLen, unsigned char *pucFPMsg, long *puiFPMsgLen);
long DLL_API SdtReadNewAppMsg(unsigned char *pucAppMsg, long *puiAppMsgLen);
long DLL_API SamGetStatus();
long DLL_API SamGetId(unsigned char *SamId, long *SamIdLen);
long DLL_API SamGetIdStr(char *SamIdStr);
long DLL_API SdtSamGetStatus();
long DLL_API SdtSamGetId(unsigned char *SamId, long *SamIdLen);
long DLL_API SdtSamGetIdStr(char *SamIdStr);

long DLL_API IdReadCard(unsigned char CardType, unsigned char InfoEncoding, char *IdCardInfo, long TimeOutMs);
long DLL_API SdtReadCard(unsigned char CardType, unsigned char InfoEncoding, char *IdCardInfo, long TimeOutMs);
long DLL_API IdReadNewAddress(char *NewAddress);
long DLL_API SdtReadNewAddress(char *NewAddress);
long DLL_API IdCardGetRawInfo(unsigned char *CHMsg, long *CHMsgLen, unsigned char *PHMsg, long *PHMsgLen, unsigned char *FPMsg, long *FPMsgLen);
long DLL_API IdCardGetName(char *Name);
long DLL_API IdCardGetNameEn(char *NameEn);
long DLL_API IdCardGetGender(char *Gender);
long DLL_API IdCardGetGenderId(char *GenderId);
long DLL_API IdCardGetNation(char *Nation);
long DLL_API IdCardGetNationId(char *NationId);
long DLL_API IdCardGetBirthDate(char *BirthDate);
long DLL_API IdCardGetAddress(char *Address);
long DLL_API IdCardGetIdNumber(char *IdNumber);
long DLL_API IdCardGetSignOrgan(char *SignOrgan);
long DLL_API IdCardGetBeginTerm(char *BeginTerm);
long DLL_API IdCardGetValidTerm(char *ValidTerm);
long DLL_API IdCardGetTypeFlag(char *TypeFlag);
long DLL_API IdCardGetVersion(char *Version);
long DLL_API IdCardGetFPBuffer(unsigned char *FPBuffer, long *FPBufferLen);
long DLL_API IdCardGetPhotoFile(char *PhotoFile);
long DLL_API IdCardGetPhotoBuffer(unsigned char WltBmpJpg, unsigned char *PhotoBuffer, long *PhotoBufferLen);

long DLL_API MagRead(unsigned char Tracks, char *TrackData1, char *TrackData2, char *TrackData3, unsigned char TimeOutSec);
long DLL_API MagWrite(unsigned char Tracks, char *TrackData1, char *TrackData2, char *TrackData3, unsigned char TimeOutSec);

long DLL_API QrRead(char *QrData, unsigned char TimeOutSec);

long DLL_API CpuPowerOn(unsigned char Slot, unsigned char *ATRS, long *ATRSLen);
long DLL_API CpuApdu(unsigned char Slot, long SendApduLen, unsigned char *SendApdu, unsigned char *RecvApdu, long *RecvApduLen);
long DLL_API CpuPowerOff(unsigned char Slot);

long DLL_API M1FindCard(unsigned char *UID, long *UIDLen);
long DLL_API M1Authentication(unsigned char KeyType, unsigned char SecAddr, unsigned char *Key, unsigned char *UID);
long DLL_API M1ReadBlock(unsigned char BlockAddr, unsigned char *BlockData, long *BlockDataLen);
long DLL_API M1WriteBlock(unsigned char BlockAddr, long BlockDataLen, unsigned char *BlockData);
long DLL_API M1Halt();

long DLL_API M0FindCard(unsigned char *UID, long *UIDLen);
long DLL_API M0Authentication(unsigned char *Key);
long DLL_API M0ReadBlock(unsigned char BlockAddr, unsigned char *BlockData, long *BlockDataLen);
long DLL_API M0WriteBlock(unsigned char BlockAddr, long BlockDataLen, unsigned char *BlockData);
long DLL_API M0Halt();

long DLL_API FpCapFeature(unsigned char *Feature, long *FeatureLen);
long DLL_API FpMatchFeature(long FeatureLen1, unsigned char *Feature1, long FeatureLen2, unsigned char *Feature2, long *Score);

long DLL_API SsseReadCard(int iType, char *SSCardInfo, char *SSErrorInfo);
long DLL_API SsseGetCardInfo(char *Tag, char *SSCardInfo);

long DLL_API IccGetCardInfo(int ICtype, char *AIDList, char *TagList, char *IcCardInfo);
long DLL_API IccGetARQC(int ICtype, char *trData, char *AIDList, char *ARQC, char *trAppData);
long DLL_API IccARPCExeScript(int ICtype, char *trData, char *ARPC, char *trAppData, char *ScriptResult, char *TC);
long DLL_API IccVerifyScript(int ICtype, char *trData, char *ARPC, char *trAppData, char *ScriptResult, char *TC);
long DLL_API IccGetTrDetail(int ICtype, char *AIDList, char *TrDetail);
long DLL_API IccGetLoadDetail(int ICtype, char *AIDList, char *LoadDetail);

long DLL_API HexToAsc(unsigned char *Hex, long HexLength, char *Asc);
long DLL_API AscToHex(char *Asc, long HexLength, unsigned char *Hex);

#ifdef __cplusplus
}
#endif